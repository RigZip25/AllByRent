type RegisterSWOptions = {
  immediate?: boolean;
  onOfflineReady?: () => void;
};

/**
 * Registers the service worker when vite-plugin-pwa is active.
 * Replace this import with `virtual:pwa-register` after `npm install -D vite-plugin-pwa`.
 */
export function registerSW(_options?: RegisterSWOptions) {
  if (import.meta.env.DEV) {
    console.info(
      "[Evorios] Install vite-plugin-pwa for full PWA (manifest + offline cache)",
    );
  }
  return () => {};
}
