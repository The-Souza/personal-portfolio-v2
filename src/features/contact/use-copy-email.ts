"use client";

import { useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copied" | "selected";

const FEEDBACK_MS = 2400;

/** Copies to the clipboard; if that is unavailable or denied, selects the text so the visitor can copy it. */
export function useCopyEmail(email: string) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (status !== "copied") return;
    const timer = setTimeout(() => setStatus("idle"), FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const select = () => {
    const node = textRef.current;
    const selection = window.getSelection();
    if (!node || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
    setStatus("selected");
  };

  const copy = () => {
    if (!navigator.clipboard) {
      select();
      return;
    }
    navigator.clipboard.writeText(email).then(() => setStatus("copied"), select);
  };

  return { status, copy, textRef };
}
