import { describe, expect, it } from "vitest";
import { fieldErrorProps } from "./a11yFieldError";

describe("fieldErrorProps (Stage 17 / X4)", () => {
  it("omits invalid attrs when there is no error", () => {
    const props = fieldErrorProps("demo-field", null);
    expect(props.input.id).toBe("demo-field");
    expect(props.input["aria-invalid"]).toBeUndefined();
    expect(props.input["aria-describedby"]).toBeUndefined();
    expect(props.errorMessage).toBeNull();
  });

  it("links the control to an alert message when errored", () => {
    const props = fieldErrorProps("demo-field", "Required");
    expect(props.input["aria-invalid"]).toBe(true);
    expect(props.input["aria-describedby"]).toBe("demo-field-error");
    expect(props.errorMessage).toEqual({
      id: "demo-field-error",
      role: "alert",
      children: "Required",
    });
  });
});
