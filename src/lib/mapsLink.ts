export function openMapsForAddress(address: string): void {
  const encoded = encodeURIComponent(address);
  const isIos =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = isIos
    ? `https://maps.apple.com/?q=${encoded}`
    : `https://maps.google.com/?q=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
