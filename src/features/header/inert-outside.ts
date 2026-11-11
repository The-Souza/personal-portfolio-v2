/**
 * Makes everything outside `element` inert (no focus, no clicks, out of the screen reader's
 * virtual cursor), as a modal needs: from the element up to <body>, every sibling at each level.
 * Returns the restore, which clears only what it set.
 */
export function inertOutside(element: Element) {
  const marked: Element[] = [];
  for (let node: Element | null = element; node && node !== document.body; node = node.parentElement) {
    for (const sibling of node.parentElement?.children ?? []) {
      if (sibling === node || sibling.hasAttribute("inert")) continue;
      sibling.setAttribute("inert", "");
      marked.push(sibling);
    }
  }
  return () => {
    for (const sibling of marked) sibling.removeAttribute("inert");
  };
}
