import { beforeEach, describe, expect, it, vi } from "vitest";

const postLlmChat = vi.fn();
const getMediaBlob = vi.fn();

vi.mock("../../lib/llmClient", () => ({
  postLlmChat: (...args: unknown[]) => postLlmChat(...args),
}));

vi.mock("../../lib/mediaStore", () => ({
  getMediaBlob: (...args: unknown[]) => getMediaBlob(...args),
}));

vi.mock("./photoUtils", () => ({
  downscaleBlobForVision: (blob: Blob) => Promise.resolve(blob),
}));

/** The module reads blobs the way a browser does; node has no FileReader. */
class NodeFileReader {
  result: string | null = null;
  error: unknown = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  readAsDataURL(blob: Blob) {
    void blob
      .arrayBuffer()
      .then((buffer) => {
        const base64 = Buffer.from(buffer).toString("base64");
        this.result = `data:${blob.type || "application/octet-stream"};base64,${base64}`;
        this.onload?.();
      })
      .catch((error) => {
        this.error = error;
        this.onerror?.();
      });
  }
}

vi.stubGlobal("FileReader", NodeFileReader);

const { moderateListingMediaPhotos, rememberPhotoModerationVerdict } = await import(
  "./listingPhotoModeration"
);

type Verdict = {
  safe?: boolean;
  isListableItem?: boolean;
  prohibited?: boolean;
  matchesCategory?: boolean | null;
  reasonCode?: string;
};

const verdict = (over: Verdict = {}) => ({
  text: JSON.stringify({
    safe: true,
    isListableItem: true,
    prohibited: false,
    matchesCategory: true,
    reasonCode: "ok",
    ...over,
  }),
});

/** Photos are read from IndexedDB by id; the bytes never reach the assertions. */
const photos = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `photo-${index}-${Math.random().toString(36).slice(2)}`,
    kind: "image" as const,
    mimeType: "image/jpeg",
    createdAt: 0,
    sizeBytes: 1,
  }));

describe("moderateListingMediaPhotos", () => {
  beforeEach(() => {
    postLlmChat.mockReset();
    getMediaBlob.mockReset();
    getMediaBlob.mockResolvedValue(new Blob(["x"], { type: "image/jpeg" }));
  });

  it("checks every photo, not the first two", async () => {
    postLlmChat.mockResolvedValue(verdict());

    const result = await moderateListingMediaPhotos(photos(12), { category: "Tools & DIY" });

    expect(result.ok).toBe(true);
    expect(postLlmChat).toHaveBeenCalledTimes(12);
  });

  it("names the photo it stopped on", async () => {
    const gallery = photos(4);
    // The third photo is the bad one; the first two pass.
    let seen = 0;
    postLlmChat.mockImplementation(async () => {
      seen += 1;
      return seen === 3
        ? verdict({ matchesCategory: false, reasonCode: "category_mismatch" })
        : verdict();
    });

    const result = await moderateListingMediaPhotos(gallery, { category: "Tools & DIY" });

    expect(result.ok).toBe(false);
    expect(result.reasonCode).toBe("category_mismatch");
    expect(result.photoNumber).toBe(3);
  });

  it("re-checks the gallery once a shelf is picked, and only once", async () => {
    const gallery = photos(3);
    postLlmChat.mockResolvedValue(verdict());

    await moderateListingMediaPhotos(gallery, {});
    expect(postLlmChat).toHaveBeenCalledTimes(3);

    // A shelf is a different question, so it costs another pass...
    await moderateListingMediaPhotos(gallery, { category: "Tools & DIY" });
    expect(postLlmChat).toHaveBeenCalledTimes(6);

    // ...but the same question twice does not.
    await moderateListingMediaPhotos(gallery, { category: "Tools & DIY" });
    expect(postLlmChat).toHaveBeenCalledTimes(6);
  });

  it("reuses the verdict the upload check already paid for", async () => {
    const gallery = photos(2);
    postLlmChat.mockResolvedValue(verdict());

    for (const photo of gallery) {
      rememberPhotoModerationVerdict(
        photo.id,
        {},
        {
          ok: true,
          reasonCode: "ok",
          safe: true,
          isListableItem: true,
          matchesCategory: null,
        },
      );
    }

    const result = await moderateListingMediaPhotos(gallery, {});

    expect(result.ok).toBe(true);
    expect(postLlmChat).not.toHaveBeenCalled();
  });

  it("does not cache a failure to reach the model", async () => {
    const gallery = photos(1);
    postLlmChat.mockRejectedValueOnce(new Error("offline"));

    const first = await moderateListingMediaPhotos(gallery, {});
    expect(first.ok).toBe(false);
    expect(first.reasonCode).toBe("verification_failed");

    postLlmChat.mockResolvedValue(verdict());
    const second = await moderateListingMediaPhotos(gallery, {});
    expect(second.ok).toBe(true);
  });

  it("treats an evicted photo as unverified rather than fine", async () => {
    getMediaBlob.mockResolvedValue(null);

    const result = await moderateListingMediaPhotos(photos(2), {});

    expect(result.ok).toBe(false);
    expect(result.reasonCode).toBe("verification_failed");
    expect(postLlmChat).not.toHaveBeenCalled();
  });
});
