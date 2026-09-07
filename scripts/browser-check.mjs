import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.TEST_URL || "http://localhost:3103/gamepulse-tools";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const dir = "docs/verification/v0.2.0";
await mkdir(dir, { recursive: true });
const results = { flows: [], responsive: [], accessibility: [], errors };
const go = async (path) => {
  const r = await page.goto(base + path);
  assert.equal(r.status(), 200, path);
  await page.waitForLoadState("domcontentloaded");
  await page.locator(".site-header").waitFor();
  await page.waitForTimeout(250);
};
const loadout = "/games/wardogs/tools/loadout-planner/";
const compare = "/games/wardogs/tools/weapon-comparator/";
const team = "/games/aniimo/tools/team-planner/";
const progress = "/games/agartha-mog-or-die/tools/progress-planner/";
const pass = "/games/agartha-mog-or-die/tools/pass-calculator/";
await go(loadout);
await expect(page.getByTestId("kit-cost")).toHaveText("$3,665");
await page
  .locator(".catalog-card")
  .filter({ has: page.getByRole("heading", { name: "M4", exact: true }) })
  .getByRole("button", { name: "Equip", exact: true })
  .click();
await expect(page.getByTestId("kit-cost")).toHaveText("$4,865");
await page
  .getByRole("button", { name: "More ammo for M4", exact: true })
  .click();
await expect(page.getByTestId("kit-cost")).toHaveText("$4,880");
await page.getByLabel("Recruit discount").check();
await expect(page.getByTestId("kit-cost")).toHaveText("$2,440");
await page.getByLabel("Your cash").fill("2000");
await expect(page.getByTestId("remaining")).toHaveText("$-440");
await expect(page.getByText("Over budget by $440")).toBeVisible();
await page.getByLabel("Plan name").fill("Browser checked kit");
await page.getByRole("button", { name: "Save plan", exact: true }).click();
await page.getByRole("button", { name: "Share", exact: true }).click();
const shared = await page.evaluate(() => navigator.clipboard.readText());
assert.ok(shared.includes("#plan="));
await page.reload();
await expect(page.getByTestId("kit-cost")).toHaveText("$2,440");
await go("/library/");
await expect(
  page.getByRole("heading", { name: "Browser checked kit" }),
).toBeVisible();
await page.getByRole("link", { name: "Open plan" }).click();
await expect(page.getByTestId("kit-cost")).toHaveText("$2,440");
const fresh = await browser.newContext();
const p2 = await fresh.newPage();
await p2.goto(shared);
await expect(p2.getByTestId("kit-cost")).toHaveText("$2,440");
await fresh.close();
results.flows.push(
  "Equipment selection, slot replacement, ammo, discount, overspend, persistence, named save and share restore",
);
await page.getByRole("button", { name: "Reset plan", exact: true }).click();
await expect(page.getByTestId("kit-cost")).toHaveText("$0");
await page.reload();
await expect(page.getByTestId("kit-cost")).toHaveText("$0");
await go("/games/wardogs/weapons/");
await page.getByLabel("Search records").fill("AK74");
await expect(page.locator(".catalog-card")).toHaveCount(1);
await page.getByRole("button", { name: "Favorite AK74", exact: true }).click();
await page.getByRole("link", { name: "Add to loadout", exact: true }).click();
await expect(page.locator(".kit-items")).toContainText("AK74");
await go("/library/");
await expect(page.locator(".catalog-card")).toContainText("AK74");
results.flows.push(
  "Search, bookmark, library favorites and database-to-loadout deep link",
);
await go(compare);
await page.getByLabel("Weapon 1", { exact: true }).selectOption("wd-ak74");
await page.getByLabel("Weapon 2", { exact: true }).selectOption("wd-m4");
await expect(page.locator(".compare-card").first()).toContainText("277 ms");
await expect(page.locator(".compare-card").nth(1)).toContainText("225 ms");
await page.getByLabel("Weapon 3", { exact: true }).selectOption("wd-pkm");
await expect(page.locator(".compare-card")).toHaveCount(3);
await page.getByLabel("Target health", { exact: true }).fill("200");
await expect(page.locator(".compare-card").first()).toContainText("646 ms");
results.flows.push(
  "Three-way sourced weapon comparison and health-dependent TTK",
);
await go(team);
await page.getByLabel("Filter category").selectOption("Fire");
await expect(page.locator(".catalog-card")).toHaveCount(4);
for (let i = 0; i < 4; i++)
  await page
    .locator(".catalog-card")
    .nth(i)
    .getByRole("button", { name: "Add to team", exact: true })
    .click();
await expect(page.locator(".team-position>strong")).toHaveCount(4);
await page.getByLabel("Filter category").selectOption("All");
await page
  .locator(".catalog-card")
  .filter({ has: page.getByRole("heading", { name: "Celestis", exact: true }) })
  .getByRole("button", { name: "Add to team", exact: true })
  .click();
await expect(page.getByRole("status")).toContainText("slots are full");
await expect(page.locator(".team-position>strong")).toHaveCount(4);
await page
  .getByRole("button", { name: "Remove Emberpup", exact: true })
  .click();
await expect(page.locator(".team-position>strong")).toHaveCount(3);
results.flows.push(
  "Official elemental filtering, team add/remove, duplicate and capacity protection",
);
await go(progress);
await page.getByLabel("Height progress", { exact: true }).fill("80");
await page.getByLabel("Face progress", { exact: true }).fill("40");
await page.getByRole("button", { name: "Log session checkpoint" }).click();
await expect(page.locator(".session-entry").first()).toContainText("30%");
await page.getByRole("button", { name: "Save plan", exact: true }).click();
await page.reload();
await expect(page.locator(".session-entry")).toHaveCount(1);
results.flows.push(
  "Personal milestones, checkpoint history and saved session persistence",
);
await go(pass);
await page.getByRole("button", { name: "Try an example" }).click();
await expect(page.locator(".estimate-saving")).toContainText("4.50 hours");
await page.getByLabel("Target resource amount", { exact: true }).fill("50");
await expect(
  page.getByText("Target already reached.", { exact: true }),
).toBeVisible();
await page.getByLabel("Observed resources per hour", { exact: true }).fill("0");
await expect(
  page.getByText("Enter a positive observed rate to calculate.", {
    exact: true,
  }),
).toBeVisible();
results.flows.push(
  "Observed-rate boost estimate, achieved target and zero-rate guard",
);
await go("/");
await page
  .getByRole("button", { name: "Search games, equipment and tools" })
  .click();
await page.getByLabel("Search catalog").fill("AK74");
await expect(page.locator(".search-results a")).toHaveCount(1);
await page.getByRole("button", { name: "Close search" }).click();
const paths = [
  "/",
  loadout,
  compare,
  team,
  progress,
  pass,
  "/games/wardogs/weapons/ak74/",
  "/library/",
];
for (const width of [390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const path of paths) {
    await go(path);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      `Overflow ${width} ${path}`,
    );
    results.responsive.push({ width, path });
  }
  console.log("responsive", width);
}
await page.setViewportSize({ width: 390, height: 844 });
await go("/");
await page.getByRole("button", { name: "Toggle navigation" }).click();
await expect(page.locator(".app-sidebar")).toHaveClass(/is-open/);
await page
  .getByRole("button", { name: "Close navigation", exact: true })
  .click();
await page.screenshot({ path: dir + "/home-mobile.png", fullPage: true });
await go(loadout);
await page.screenshot({ path: dir + "/loadout-mobile.png", fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
for (const [name, path] of [
  ["home", "/"],
  ["loadout", loadout],
  ["compare", compare],
  ["team", team],
  ["progress", progress],
]) {
  await go(path);
  if (name === "loadout")
    await page.getByRole("button", { name: "Field essentials" }).click();
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((i) => i.decode().catch(() => {})),
    );
  });
  await page.screenshot({
    path: dir + "/" + name + "-desktop.png",
    fullPage: true,
  });
  const a = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  results.accessibility.push({
    path,
    violations: a.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
await writeFile(
  dir + "/browser-results.json",
  JSON.stringify(results, null, 2),
);
assert.equal(errors.length, 0, errors.join("\n"));
const serious = results.accessibility.flatMap((a) =>
  a.violations.filter((v) => ["critical", "serious"].includes(v.impact)),
);
assert.equal(serious.length, 0, JSON.stringify(serious, null, 2));
await browser.close();
console.log(
  JSON.stringify(
    {
      flows: results.flows.length,
      responsive: results.responsive.length,
      accessibility: results.accessibility.map((a) => ({
        path: a.path,
        violations: a.violations.length,
      })),
      errors: errors.length,
    },
    null,
    2,
  ),
);
