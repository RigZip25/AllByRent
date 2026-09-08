/** Wire validation messages to controls (Stage 17 / X4). */
export function fieldErrorProps(fieldId: string, error: string | null | undefined) {
  const errorId = `${fieldId}-error`;
  if (!error) {
    return {
      input: {
        id: fieldId,
        "aria-invalid": undefined as undefined,
        "aria-describedby": undefined as undefined,
      },
      errorId,
      errorMessage: null as null,
    };
  }
  return {
    input: {
      id: fieldId,
      "aria-invalid": true as const,
      "aria-describedby": errorId,
    },
    errorId,
    errorMessage: {
      id: errorId,
      role: "alert" as const,
      children: error,
    },
  };
}
