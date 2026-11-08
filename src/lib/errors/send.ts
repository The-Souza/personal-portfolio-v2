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
  if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) return;
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {
    // Reporting must never throw on top of the error it reports.
  });
}
