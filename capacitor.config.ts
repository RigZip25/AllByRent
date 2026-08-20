import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native store shell for the Evorios PWA.
 * UI is bundled into the app binary; /api/* calls are rewritten at runtime
 * to https://app.evorios.com (see src/lib/nativeShell.ts).
 *
 * appId is the Android applicationId (`com.evorios.app`). Do NOT change it to
 * match iOS — Apple rejected `com.evorios.app`, so the iOS bundle is set only
 * via Xcode PRODUCT_BUNDLE_IDENTIFIER = `com.elflogistics.evorios`
 * (ios/App/App.xcodeproj/project.pbxproj). `npx cap sync` must not overwrite that.
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
    /**
     * Native Face ID / passkeys: WebView origin is capacitor://localhost, but
     * RP ID + clientDataJSON must be https://app.evorios.com (AASA + assetlinks).
     */
    CapacitorPasskey: {
      origin: "https://app.evorios.com",
      autoShim: true,
      domains: ["app.evorios.com"],
    },
    SplashScreen: {
      // Keep native splash until JS calls SplashScreen.hide() (see hideNativeSplash).
      // Returning users still see the branded React splash on cold start.
      launchAutoHide: false,
      launchShowDuration: 2000,
      backgroundColor: "#062a1c",
      showSpinner: false,
      androidSplashResourceName: "splash",
      splashFullScreen: true,
    },
    StatusBar: {
      // Overlay + CSS safe-area (PWA-compatible). Non-overlay + contentInset automatic
      // was stacking with env(safe-area-inset-top) and leaving a blank top band.
      style: "LIGHT",
      backgroundColor: "#0D5C3A",
      overlaysWebView: true,
    },
  },
  ios: {
    // "never" = edge-to-edge WebView; CSS env(safe-area-inset-*) pads chrome.
    // "automatic" also insets the WKWebView, which doubles the top gap with our headers.
    contentInset: "never",
    preferredContentMode: "mobile",
    scheme: "Evorios",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
