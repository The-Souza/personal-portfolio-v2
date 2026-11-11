import type { ClientErrorReport } from "@/lib/errors/report";

const ENDPOINT = "/api/client-error";
/** A page stuck in an error loop shouldn't flood the logs. */
const MAX_PER_PAGE = 10;

const sent = new Set<string>();

/**
 * Sends a browser error to the server log. `sendBeacon` survives the visitor leaving the page;
 * without it, fetch with `keepalive`. Each distinct error goes once, at most 10 per page.
 */
export function sendClientError(report: ClientErrorReport) {
  const key = `${report.source}|${report.message}|${report.path}`;
  if (sent.has(key) || sent.size >= MAX_PER_PAGE) return;
  sent.add(key);

  const body = JSON.stringify(report);
  // Some Chromium versions threw on a Blob whose type isn't CORS-safelisted (application/json);
  // a throw here would skip the fetch below and raise one more error on top of the reported one.
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) return;
  } catch {
    // Falls through to fetch.
  }
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {
    // Reporting must never throw on top of the error it reports.
  });
}
