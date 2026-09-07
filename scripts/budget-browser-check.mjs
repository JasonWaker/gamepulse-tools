import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.TEST_URL || "http://localhost:3103/gamepulse-tools";
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const route = "/games/wardogs/tools/loadout-planner/";
await page.goto(base + route, { waitUntil: "domcontentloaded" });
await page.locator('.player-workbench[data-ready="true"]').waitFor();
await expect(page.getByTestId("kit-cost")).toHaveText("$3,665");
await page.getByLabel("Your cash", { exact: true }).fill("6000");
await expect(page.getByTestId("proposed-cost")).toHaveText("$2,065");
await page.getByRole("button", { name: "Apply recommended kit" }).click();
await expect(page.getByTestId("kit-cost")).toHaveText("$2,065");
await page.getByRole("button", { name: "Undo last replacement" }).click();
await expect(page.getByTestId("kit-cost")).toHaveText("$3,665");
await page.getByRole("button", { name: "AK74", exact: true }).click();
await expect(
  page.getByRole("button", { name: "Apply recommended kit" }),
).toBeDisabled();
await expect(page.locator(".advisor-result")).toContainText("No kit fits");
await page.getByRole("button", { name: "AK74", exact: true }).click();
await page.getByLabel("Minimum primary range").selectOption("500");
await expect(page.locator(".swap-row")).toContainText("T-21");
await page.getByRole("button", { name: "Apply recommended kit" }).click();
await expect(page.getByTestId("kit-cost")).toHaveText("$2,665");
await page.getByRole("button", { name: "Vehicle 0", exact: true }).click();
await page
  .locator(".catalog-card")
  .filter({ has: page.getByRole("heading", { name: "Kodiak", exact: true }) })
  .getByRole("button", { name: "Equip", exact: true })
  .click();
await expect(page.getByTestId("kit-cost")).toHaveText("$5,165");
await page.getByLabel("Minimum vehicle seats").selectOption("3");
await page
  .getByRole("button", { name: "Replace Kodiak with Dune Buggy" })
  .click();
await expect(page.getByTestId("kit-cost")).toHaveText("$4,165");
await page.getByRole("button", { name: "Share", exact: true }).click();
const link = await page.evaluate(() => navigator.clipboard.readText());
const fresh = await browser.newContext();
const restored = await fresh.newPage();
await restored.goto(link, { waitUntil: "domcontentloaded" });
await restored.locator('.player-workbench[data-ready="true"]').waitFor();
await expect(restored.getByTestId("kit-cost")).toHaveText("$4,165");
await expect(restored.locator(".kit-row")).toHaveCount(6);
await expect(restored.getByLabel("Minimum primary range")).toHaveValue("500");
await expect(restored.getByLabel("Minimum vehicle seats")).toHaveValue("3");
await fresh.close();
await page.goto(base + "/games/agartha-mog-or-die/codes/", {
  waitUntil: "domcontentloaded",
});
await page.waitForTimeout(300);
await expect(page.locator(".code-card")).toHaveCount(4);
await page
  .locator(".code-card")
  .first()
  .getByRole("button", { name: "Copy code" })
  .click();
assert.equal(
  await page.evaluate(() => navigator.clipboard.readText()),
  "tyfor300likes",
);
await expect(page.getByRole("status")).toContainText("tyfor300likes copied");
await expect(page.locator('.site-header a[href*="releases"]')).toHaveCount(0);
const dir = "docs/verification/v0.3.0";
await mkdir(dir, { recursive: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(500);
await page.screenshot({ path: dir + "/codes-mobile.png", fullPage: true });
await page.goto(base + route, { waitUntil: "domcontentloaded" });
await page.locator('.player-workbench[data-ready="true"]').waitFor();
await page.setViewportSize({ width: 1440, height: 1000 });
await page
  .locator(".budget-advisor")
  .screenshot({ path: dir + "/budget-advisor.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page
  .locator(".budget-advisor")
  .screenshot({ path: dir + "/budget-advisor-mobile.png" });
assert.deepEqual(errors, []);
await writeFile(
  dir + "/budget-results.json",
  JSON.stringify(
    {
      passed: true,
      flows: [
        "reserve rebuys, preview, apply and undo",
        "locked and impossible budgets",
        "range and seats constraints",
        "vehicle slot and six-slot share restoration",
        "four official codes and exact clipboard copy",
        "header version stays removed",
      ],
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
console.log("Budget and codes browser flows passed.");
