import { toClientReport } from "@/lib/errors/report";
import { sendClientError } from "@/lib/errors/send";

// Browser errors no component catches, sent to the server log (see /api/client-error). The ones
// the error page catches are reported by ErrorView itself: React keeps them from reaching here.
window.addEventListener("error", (event) => {
  sendClientError(toClientReport(event.error ?? event.message, "window", window.location.pathname));
});

window.addEventListener("unhandledrejection", (event) => {
  sendClientError(toClientReport(event.reason, "promise", window.location.pathname));
});
