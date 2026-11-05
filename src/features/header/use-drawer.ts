"use client";

import { useEffect, useRef, useState } from "react";

const DESKTOP_MIN_WIDTH = 1024;
const FOCUSABLE = "a[href], button";

export function useDrawer() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const panel = panelRef.current;
    const initial = panel?.querySelector<HTMLElement>('[aria-current="true"]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    initial?.focus();

    const closeAndReturnFocus = () => {
      setOpen(false);
      triggerRef.current?.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndReturnFocus();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    const onResize = () => {
      if (window.innerWidth >= DESKTOP_MIN_WIDTH) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return { open, openDrawer: () => setOpen(true), close, triggerRef, panelRef };
}
