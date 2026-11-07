import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// One place to register plugins, so every act imports GSAP ready to use.
gsap.registerPlugin(useGSAP, ScrollTrigger);
// No refresh on resize: `relayout` rebuilds the acts and refreshes once, in a single task, so no
// frame runs with half the acts measured at the old size. Browser only: this module is also
// evaluated on the server, where ScrollTrigger has no window to configure.
if (typeof window !== "undefined") {
  ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" });
}

export { gsap, ScrollTrigger, useGSAP };
