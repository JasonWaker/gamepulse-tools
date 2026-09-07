import { test } from "node:test";
import assert from "node:assert/strict";
import {
  recommendBudget,
  cheaperAlternatives,
  type BudgetInput,
} from "../src/lib/budget";
import { equipment, kitCost, presets } from "../src/lib/equipment";
const base: BudgetInput = {
  ids: presets[0].items,
  ammo: { "wd-ak74": 3, "wd-m1911": 2 },
  budget: 6000,
  discount: false,
  rebuys: 1,
  locked: [],
  sameClass: true,
  minRange: 0,
  minSeats: 1,
  strategy: "fewest",
};
test("budget recommendation reserves rebuys and preserves filled slots and ammo counts", () => {
  const p = recommendBudget(base)!;
  assert.equal(p.fits, true);
  assert.equal(p.changes.length, 1);
  assert.equal(p.ids.length, base.ids.length);
  assert.equal(p.cost, kitCost(p.ids, p.ammo));
  assert.ok(p.cost * 2 <= base.budget);
  assert.equal(p.ammo[p.changes[0].to.id], 3);
});
test("locks, range floors and impossible budgets do not silently remove essentials", () => {
  const p = recommendBudget({ ...base, budget: 100, locked: base.ids })!;
  assert.equal(p.fits, false);
  assert.deepEqual(p.ids, base.ids);
  assert.equal(p.cost, 3665);
  const q = recommendBudget({ ...base, budget: 6000, minRange: 500 })!;
  assert.ok(
    q.ids.every((id) => {
      const e = equipment.find((e) => e.id === id)!;
      return e.data_json.slot !== "Primary" || Number(e.data_json.range) >= 500;
    }),
  );
  assert.equal(recommendBudget({ ...base, minRange: 99999 }), null);
  assert.equal(recommendBudget({ ...base, ids: [] }), null);
});
test("free weapon still includes ammo; cheapest fit applies recruit discount consistently", () => {
  const p = recommendBudget({
    ...base,
    ids: ["wd-ak74"],
    budget: 100,
    rebuys: 1,
    strategy: "cheapest",
  })!;
  assert.deepEqual(p.ids, ["wd-bushmaster-m17s"]);
  assert.equal(p.cost, 45);
  assert.equal(p.fits, true);
  const d = recommendBudget({
    ...base,
    ids: ["wd-ak74"],
    budget: 50,
    rebuys: 1,
    strategy: "cheapest",
    discount: true,
  })!;
  assert.equal(d.cost, 22.5);
  assert.equal(d.fits, true);
});
test("vehicle replacement honors minimum seats and cannot replace another slot", () => {
  const input = {
    ...base,
    ids: ["wd-kodiak"],
    ammo: {},
    budget: 10000,
    strategy: "cheapest" as const,
    minSeats: 3,
  };
  const p = recommendBudget(input)!;
  assert.deepEqual(p.ids, ["wd-dune-buggy"]);
  assert.equal(recommendBudget({ ...input, minSeats: 4 })!.ids[0], "wd-kodiak");
});
test("single swaps use replacement ammo prices and respect locked items", () => {
  const e = equipment.find((e) => e.id === "wd-ak74")!;
  const swaps = cheaperAlternatives(e, { ...base, sameClass: false });
  const amp = swaps.find((x) => x.entity.id === "wd-amp-9");
  assert.ok(amp);
  assert.equal(amp.saving, 715);
  assert.deepEqual(cheaperAlternatives(e, { ...base, locked: [e.id] }), []);
});
test("fewest swaps returns an already fitting kit without unnecessary changes", () => {
  const p = recommendBudget({ ...base, budget: 10000 })!;
  assert.equal(p.changes.length, 0);
  assert.equal(p.cost, 3665);
});
