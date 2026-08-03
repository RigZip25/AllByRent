import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native store shell for the Evorios PWA.
 * UI is bundled into the app binary; /api/* calls are rewritten at runtime
 * to https://app.evorios.com (see src/lib/nativeShell.ts).
 */
const config: CapacitorConfig = {
  appId: "com.evorios.app",
  appName: "Evorios",
  webDir: "dist",
  server: {
    androidScheme: "https",
    allowNavigation: [
      "app.evorios.com",
      "evorios.com",
      "*.stripe.com",
      "*.supabase.co",
      "accounts.google.com",
      "appleid.apple.com",
    ],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#062a1c",
      showSpinner: false,
      androidSplashResourceName: "splash",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0D5C3A",
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Evorios",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
