const RULES_SEEN_KEY = "evorios_garage_sale_rules_seen";

export function hasSeenGarageSaleRules(): boolean {
  try {
    return localStorage.getItem(RULES_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markGarageSaleRulesSeen(): void {
  try {
    localStorage.setItem(RULES_SEEN_KEY, "1");
  } catch {
    /* */
  }
}
