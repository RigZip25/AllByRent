export function getAnthropicApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
}

export function getPhotoRoomApiKey(): string | undefined {
  return process.env.PHOTOROOM_API_KEY || process.env.VITE_PHOTOROOM_API_KEY;
}
