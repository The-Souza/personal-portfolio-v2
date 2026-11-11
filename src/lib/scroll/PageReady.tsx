"use client";

import { useLayoutEffect } from "react";
import { markPageReady } from "@/lib/scroll/page-ready";

/** Render last in the page: marks it hydrated once every act above has built (see `page-ready`). */
export function PageReady() {
  useLayoutEffect(() => markPageReady(), []);
  return null;
}
