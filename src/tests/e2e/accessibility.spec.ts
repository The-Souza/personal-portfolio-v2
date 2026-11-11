import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** WCAG 2.1 A and AA (brief, section 12). */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const summary = (violations: { id: string; help: string; nodes: { target: unknown }[] }[]) =>
  violations.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.map((node) => String(node.target)).join(", ")})`);

test("a home não tem violações de acessibilidade", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pt");
  await expect(page.locator("#boot")).toHaveCount(0, { timeout: 20_000 });
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(summary(violations)).toEqual([]);
});

test("o 404 não tem violações de acessibilidade", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto("/pt/rota-que-nao-existe");
  expect(response?.status()).toBe(404);
  // Let the entrance settle: axe reads colors, and items fading in would skew contrast.
  await page.waitForTimeout(1500);
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(summary(violations)).toEqual([]);
});
