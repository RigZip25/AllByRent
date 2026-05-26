export async function processPhotoWithPhotoRoom(file: File): Promise<Blob> {
  const apiKey = import.meta.env.VITE_PHOTOROOM_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("Missing VITE_PHOTOROOM_API_KEY");
  }

  const formData = new FormData();
  formData.append("imageFile", file);
  formData.append("background.color", "ffffff");
  formData.append("outputSize", "1200x1200");
  formData.append("padding", "0.1");

  const response = await fetch("https://image-api.photoroom.com/v2/edit", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`PhotoRoom request failed (${response.status})`);
  }

  return response.blob();
}
