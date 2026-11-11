"use client";

import { useEffect } from "react";
import { ACT_IDS } from "@/content/acts";
import { onRelayout, onRelayoutStart } from "@/lib/scroll/relayout";
import { placeAt, scrollForPlace, settleScrubs, type SectionBox } from "@/lib/scroll/scroll-keeper";

function measure(): SectionBox[] {
  return ACT_IDS.flatMap((id) => {
    const section = document.getElementById(id);
    if (!section) return [];
    const box = section.getBoundingClientRect();
    return [{ id, top: box.top + window.scrollY, height: box.height }];
  });
}

/**
 * Render once in the page: keeps the visitor in the same place of the same act across a
 * relayout (a new width, or a band change like a phone turning), which rebuilds the acts and
 * changes the height of everything above.
 */
export function ScrollKeeper() {
  useEffect(() => {
    let place = placeAt(measure(), window.scrollY);
    // Until the relayout, the page reflows at the new size but nothing is measured again: the
    // place recorded before the resize is the one to return to.
    let resizing = false;

    const onScroll = () => {
      if (!resizing) place = placeAt(measure(), window.scrollY);
    };
    const stopStart = onRelayoutStart(() => {
      resizing = true;
    });
    const stopDone = onRelayout(() => {
      const target = place && scrollForPlace(measure(), place);
      if (target !== null && Math.abs(target - window.scrollY) > 1) window.scrollTo(0, target);
      settleScrubs();
      resizing = false;
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stopStart();
      stopDone();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
