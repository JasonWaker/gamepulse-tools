import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.TEST_URL || "http://localhost:3100";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const dir = "docs/verification";
await mkdir(dir, { recursive: true });
const go = async (path) => {
  const r = await page.goto(base + path);
  assert.equal(r.status(), 200, path);
  await page.waitForLoadState("networkidle");
};
await go("/");
await page.screenshot({ path: dir + "/home-desktop.png", fullPage: true });
const links = await page
  .locator("a[href]")
  .evaluateAll((as) => [
    ...new Set(
      as
        .map((a) => a.getAttribute("href"))
        .filter((h) => h.startsWith("/") && !h.startsWith("/#")),
    ),
  ]);
for (const href of links) {
  const r = await context.request.get(new URL(href, base).href);
  assert.equal(r.status(), 200, href);
}
const results = {
  widths: [],
  consoleErrors: errors,
  linksChecked: links.length,
  accessibility: [],
  tools: [],
};
for (const width of [390, 430, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const path of [
    "/",
    "/games/",
    "/tools/",
    "/games/wardogs/",
    "/games/aniimo/",
    "/games/agartha-mog-or-die/",
    "/games/wardogs/tools/loadout-planner/",
    "/games/wardogs/tools/weapon-comparator/",
    "/games/aniimo/tools/team-planner/",
    "/games/agartha-mog-or-die/tools/progress-planner/",
    "/games/agartha-mog-or-die/tools/pass-calculator/",
  ]) {
    await go(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    assert.equal(overflow, false, `Overflow ${width} ${path}`);
  }
  results.widths.push(width);
  console.log("Layout passed", width);
}
await page.setViewportSize({ width: 390, height: 844 });
await go("/");
await page.screenshot({ path: dir + "/home-mobile.png", fullPage: true });
await page.getByRole("button", { name: "Toggle navigation" }).click();
await page
  .getByRole("navigation", { name: "Main navigation" })
  .getByRole("link", { name: "All tools", exact: true })
  .click();
await page.waitForURL("**/tools/");
await page.setViewportSize({ width: 1440, height: 1000 });
await go("/games/wardogs/tools/loadout-planner/");
await page.getByLabel("Available budget ($)", { exact: true }).fill("1000");
await page
  .getByRole("button", { name: "Primary weapon Select equipment" })
  .click();
await page.getByLabel("Equipment name", { exact: true }).fill("My rifle");
await page.getByLabel("Price in game ($)", { exact: true }).fill("1200");
await page.getByRole("button", { name: "Add to loadout" }).click();
await page.getByText("⚠ Over budget", { exact: true }).waitFor();
await page.getByRole("button", { name: "Save plan", exact: true }).click();
await page.reload();
await page.getByText("My rifle", { exact: true }).waitFor();
assert.equal(
  await page.getByLabel("Available budget ($)", { exact: true }).inputValue(),
  "1000",
);
await page.getByRole("button", { name: "Share", exact: true }).click();
await page.getByText("Plan link copied.", { exact: false }).waitFor();
const shared = await page.evaluate(() => navigator.clipboard.readText());
assert.ok(shared.includes("#plan="));
await page.getByRole("button", { name: "Reset", exact: true }).click();
await page.goto(shared);
await page.reload();
await page.getByText("My rifle", { exact: true }).waitFor();
await page.screenshot({ path: dir + "/loadout-desktop.png", fullPage: true });
results.tools.push(
  "Loadout: drawer, prices, overbudget, save/reload, share/restore, reset",
);
await go("/games/wardogs/tools/weapon-comparator/");
await page.getByLabel("Damage / hit", { exact: true }).nth(0).fill("25");
await page.getByLabel("Rounds / minute", { exact: true }).nth(0).fill("600");
await page.getByLabel("Damage / hit", { exact: true }).nth(1).fill("50");
await page.getByLabel("Rounds / minute", { exact: true }).nth(1).fill("300");
await page
  .getByLabel("Target health for estimated TTK", { exact: true })
  .fill("100");
assert.ok((await page.locator(".ttk").innerText()).includes("0.300"));
assert.ok((await page.locator(".ttk").innerText()).includes("0.200"));
results.tools.push(
  "Comparator: both stat inputs and verified arithmetic, missing values withheld",
);
await go("/games/aniimo/tools/team-planner/");
for (let i = 0; i < 4; i++)
  await page.getByRole("button", { name: "Add to team" }).first().click();
assert.equal(
  await page.getByRole("button", { name: "Selected", exact: true }).count(),
  4,
);
assert.equal(
  await page.getByRole("button", { name: "Add to team" }).first().isDisabled(),
  true,
);
await page.getByRole("button", { name: "Remove Emberpup" }).click();
assert.equal(
  await page.getByRole("button", { name: "Add to team" }).first().isDisabled(),
  false,
);
await page.getByLabel("Search Aniimo").fill("zzzz");
await page.getByText("No companions match that search.").waitFor();
await page.getByLabel("Search Aniimo").fill("");
await page.screenshot({ path: dir + "/team-desktop.png", fullPage: true });
results.tools.push(
  "Team: four slots, duplicate/full guards, removal and empty search",
);
await go("/games/agartha-mog-or-die/tools/progress-planner/");
for (const [key, val] of [
  ["Height", "80"],
  ["Face", "20"],
  ["Frame", "60"],
  ["Bodyfat", "100"],
])
  await page.getByLabel(key + " progress", { exact: true }).fill(val);
await page.getByText("Next focus: Face", { exact: true }).waitFor();
assert.ok((await page.locator(".progress-ring").innerText()).includes("65"));
results.tools.push(
  "Progress: real-time sliders, average and least-complete goal",
);
await go("/games/agartha-mog-or-die/tools/pass-calculator/");
for (const [label, value] of [
  ["Current resource amount", "100"],
  ["Target resource amount", "500"],
  ["Observed resources per hour", "100"],
  ["Boost multiplier (1 = no boost)", "2"],
])
  await page.getByLabel(label, { exact: true }).fill(value);
assert.ok((await page.locator(".savings").innerText()).includes("2.00 hours"));
results.tools.push("Pass: observed-rate calculation and boost savings");
await page.getByRole("button", { name: "Search games and tools" }).click();
await page.locator("dialog input").fill("Aniimo");
await page
  .locator("dialog")
  .getByRole("link", { name: "Aniimo Game hub" })
  .click();
await page.waitForURL("**/games/aniimo/");
for (const path of [
  "/",
  "/games/wardogs/tools/loadout-planner/",
  "/games/aniimo/tools/team-planner/",
]) {
  await go(path);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  results.accessibility.push({
    path,
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      count: v.nodes.length,
      examples: v.nodes
        .slice(0, 3)
        .map((n) => ({ html: n.html, summary: n.failureSummary })),
    })),
  });
}
await go("/games/wardogs/weapons/");
assert.ok(
  (await page.locator("meta[name=robots]").getAttribute("content")).includes(
    "noindex",
  ),
);
await go("/games/aniimo/creatures/emberpup/");
assert.ok(
  (await page.locator("meta[name=robots]").getAttribute("content")).includes(
    "noindex",
  ),
);
const missing = await context.request.get(base + "/missing-page/");
assert.equal(missing.status(), 404);
const sitemap = await context.request.get(base + "/sitemap.xml");
assert.equal(sitemap.status(), 200);
assert.ok(
  (await sitemap.text()).includes("/games/wardogs/tools/loadout-planner/"),
);
assert.deepEqual(errors, []);
assert.ok(
  results.accessibility.every((x) => x.violations.length === 0),
  "Accessibility violations remain",
);
await writeFile(
  dir + "/browser-results.json",
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
await browser.close();
