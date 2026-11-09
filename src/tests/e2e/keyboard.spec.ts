import { expect, test } from "@playwright/test";

/**
 * Brief, section 5: the page works from the keyboard. Every element the Tab key reaches has to be
 * on screen and fully visible, even inside the pinned acts, whose hidden starting states and
 * clipped track the browser's own focus scrolling would otherwise get around.
 */
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`com Tab, todo elemento focado fica visível em ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/pt");
    await expect(page.locator("#boot")).toHaveCount(0, { timeout: 20_000 });

    const stops: string[] = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      // The entrances (springs) finish within this.
      await page.waitForTimeout(1200);
      const focus = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const box = el.getBoundingClientRect();
        let opacity = 1;
        for (let node: Element | null = el; node && node !== document.documentElement; node = node.parentElement) {
          opacity *= Number(getComputedStyle(node).opacity);
        }
        const viewportEl = document.querySelector<HTMLElement>("[data-projects-viewport]");
        return {
          label: (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
          footer: Boolean(el.closest("footer")),
          onScreen: box.bottom > 0 && box.top < window.innerHeight && box.right > 0 && box.left < window.innerWidth,
          opacity,
          trackScrolled: viewportEl ? viewportEl.scrollLeft !== 0 : false,
        };
      });
      // Past the page's last link the focus goes to the browser chrome.
      if (!focus) break;
      stops.push(focus.label);
      expect(focus.onScreen, `"${focus.label}" fora da tela`).toBe(true);
      expect(focus.opacity, `"${focus.label}" com opacidade ${focus.opacity}`).toBeGreaterThan(0.99);
      expect(focus.trackScrolled, `o trilho dos projetos rolou ao focar "${focus.label}"`).toBe(false);
      if (focus.footer && focus.label.includes("Topo")) break;
    }
    // It really went through the acts, not just the header.
    expect(stops.some((label) => label.includes("WhatsApp"))).toBe(true);
  });
}
