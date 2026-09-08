import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearOverlayStackForTests,
  hasOverlay,
  popOverlay,
  pushOverlay,
  removeOverlay,
} from "./overlayBackStack";

afterEach(() => {
  clearOverlayStackForTests();
});

describe("overlayBackStack", () => {
  it("pops LIFO and invokes close", () => {
    const first = vi.fn();
    const second = vi.fn();
    pushOverlay("a", first);
    pushOverlay("b", second);
    expect(hasOverlay()).toBe(true);
    expect(popOverlay()).toBe(true);
    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
    expect(popOverlay()).toBe(true);
    expect(first).toHaveBeenCalledOnce();
    expect(popOverlay()).toBe(false);
    expect(hasOverlay()).toBe(false);
  });

  it("replaces same id instead of stacking duplicates", () => {
    const older = vi.fn();
    const newer = vi.fn();
    pushOverlay("sheet", older);
    pushOverlay("sheet", newer);
    expect(popOverlay()).toBe(true);
    expect(newer).toHaveBeenCalledOnce();
    expect(older).not.toHaveBeenCalled();
    expect(popOverlay()).toBe(false);
  });

  it("removeOverlay drops without calling close", () => {
    const close = vi.fn();
    pushOverlay("auth", close);
    removeOverlay("auth");
    expect(hasOverlay()).toBe(false);
    expect(popOverlay()).toBe(false);
    expect(close).not.toHaveBeenCalled();
  });
});
