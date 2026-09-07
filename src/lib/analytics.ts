export type EventName =
  "tool_view" | "tool_start" | "tool_complete" | "tool_share" | "entity_view";
export function track(
  event: EventName,
  tool: string,
  metadata: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;
  const w = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  try {
    if (localStorage.getItem("gp-analytics") !== "yes") return;
  } catch {
    return;
  }
  w.gtag?.("event", event, { tool_id: tool, ...metadata });
}
