import { describe, expect, it } from "vitest";
import { isAllowedCorsOrigin, getAllowedCorsOrigins } from "./cors";

describe("cors allowlist", () => {
  it("allows app and local Capacitor origins", () => {
    expect(isAllowedCorsOrigin("https://app.evorios.com")).toBe(true);
    expect(isAllowedCorsOrigin("http://localhost:5173")).toBe(true);
    expect(isAllowedCorsOrigin("capacitor://localhost")).toBe(true);
    expect(isAllowedCorsOrigin("https://localhost")).toBe(true);
  });

  it("rejects arbitrary origins", () => {
    expect(isAllowedCorsOrigin("https://evil.example")).toBe(false);
    expect(isAllowedCorsOrigin("https://app.evorios.com.evil.com")).toBe(false);
    expect(isAllowedCorsOrigin(undefined)).toBe(false);
  });

  it("includes marketing host", () => {
    const list = getAllowedCorsOrigins();
    expect(list).toContain("https://evorios.com");
  });
});
