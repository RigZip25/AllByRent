const WORKFLOW_SEEN_KEY = "evorios_garage_workflow_seen";

export function hasSeenGarageWorkflow(): boolean {
  try {
    return localStorage.getItem(WORKFLOW_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markGarageWorkflowSeen(): void {
  try {
    localStorage.setItem(WORKFLOW_SEEN_KEY, "1");
  } catch {
    /* */
  }
}
