import { describe, expect, it } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import classify from "../../server/routes/listing/classify";
import fields from "../../server/routes/listing/fields";
import copy from "../../server/routes/listing/copy";

/**
 * The endpoints answer with the status codes the client turns into flow states,
 * and they stay answers — never thrown errors — when no model is configured.
 */

// A 1x1 JPEG: large enough to pass the payload guard, cheap enough to inline.
const JPEG =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwcJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPDs0NDX/wAALCAABAAEBAREA/8QAFAABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKAA/9k=";

type Answer = { status: number; body: { ok?: boolean; code?: string } };

function capture(): { res: VercelResponse; answer: Answer } {
  const answer: Answer = { status: 0, body: {} };
  const res = {
    setHeader: () => res,
    status: (code: number) => {
      answer.status = code;
      return res;
    },
    json: (body: Answer["body"]) => {
      answer.body = body;
      return res;
    },
    end: () => res,
  } as unknown as VercelResponse;
  return { res: res as VercelResponse, answer };
}

const post = (body: unknown) =>
  ({ method: "POST", headers: {}, body }) as unknown as VercelRequest;

describe("listing AI endpoints", () => {
  it("only accepts POST", async () => {
    const { res, answer } = capture();
    await classify({ method: "GET", headers: {} } as unknown as VercelRequest, res);
    expect(answer.status).toBe(405);
  });

  it("asks for a photo before analyzing", async () => {
    const { res, answer } = capture();
    await classify(post({ images: [] }), res);
    expect(answer.status).toBe(400);
    expect(answer.body.code).toBe("invalid_request");
  });

  it("names an unsupported photo format for what it is", async () => {
    const { res, answer } = capture();
    await classify(post({ images: [{ mimeType: "image/tiff", data: JPEG }] }), res);
    expect(answer.status).toBe(415);
    expect(answer.body.code).toBe("unsupported_image");
  });

  it("reports an unconfigured model as unavailable, not as a crash", async () => {
    const { res, answer } = capture();
    await classify(post({ images: [{ mimeType: "image/jpeg", data: JPEG }] }), res);
    expect(answer.status).toBe(503);
    expect(answer.body.code).toBe("unavailable");
  });

  it("rejects a field-fill request that names no schema", async () => {
    const { res, answer } = capture();
    await fields(post({ categoryId: "photo-video" }), res);
    expect(answer.status).toBe(400);
    expect(answer.body.code).toBe("invalid_request");
  });

  it("rejects a copy request without the confirmed data", async () => {
    const { res, answer } = capture();
    await copy(post({ categoryId: "photo-video", subcategoryId: "camera-kits" }), res);
    expect(answer.status).toBe(400);
    expect(answer.body.code).toBe("invalid_request");
  });
});
