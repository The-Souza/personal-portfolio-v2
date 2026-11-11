import { expect, type Page, test } from "@playwright/test";

/** Brief, section 12: the five screens the acts are built for. */
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 820, height: 1180 },
  { width: 1180, height: 820 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
];
const ACTS = ["hero", "about", "projects", "stack", "contact"];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("uma rota que não existe mostra o 404 com status real, sem erro e no mesmo endereço", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto("/pt/rota-que-nao-existe");
  expect(response?.status()).toBe(404);
  // The entrance splits the title into an sr-only copy plus aria-hidden words, so its text
  // content doubles once hydrated; the accessible name is what reads.
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Essa rota saiu do mapa.");
  // The proxy serves the 404 route's HTML; the address bar keeps what the visitor typed.
  await page.waitForTimeout(2000);
  expect(new URL(page.url()).pathname).toBe("/pt/rota-que-nao-existe");
  await expect(page.locator("[data-special]")).toContainText("get /pt/rota-que-nao-existe", { ignoreCase: true });
  // The 404 response itself is logged as a failed resource; anything else is a real error.
  expect(errors.filter((error) => !error.includes("404"))).toEqual([]);
});

for (const viewport of VIEWPORTS) {
  test(`rola a página inteira em ${viewport.width}×${viewport.height} sem erro nem scroll horizontal`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.setViewportSize(viewport);
    await page.goto("/pt");
    // The boot veil leaves once the page hands over.
    await expect(page.locator("#boot")).toHaveCount(0, { timeout: 20_000 });

    const seen = new Set<string>();
    for (let y = 0; ; y += Math.round(viewport.height * 0.6)) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(150);
      const state = await page.evaluate((ids) => {
        const root = document.documentElement;
        return {
          overflowing: root.scrollWidth > root.clientWidth,
          visible: ids.filter((id) => {
            const box = document.getElementById(id)?.getBoundingClientRect();
            return box ? box.top < window.innerHeight && box.bottom > 0 : false;
          }),
          max: root.scrollHeight - window.innerHeight,
        };
      }, ACTS);
      expect(state.overflowing, `scroll horizontal em y=${y}`).toBe(false);
      for (const id of state.visible) seen.add(id);
      if (y >= state.max) break;
    }

    expect([...seen].sort()).toEqual([...ACTS].sort());
    expect(errors).toEqual([]);
  });
}
