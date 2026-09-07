import { test } from "node:test";
import assert from "node:assert/strict";
import {
  kitCost,
  presets,
  timeToKill,
  equipment,
  weapons,
} from "../src/lib/equipment";
import { entities } from "../src/lib/registry";
test("A sourced deployment includes ammunition and halves every included cost for recruit discount", () => {
  const ammo = { "wd-ak74": 3, "wd-m1911": 2 };
  assert.equal(kitCost(presets[0].items, ammo), 3665);
  assert.equal(kitCost(presets[0].items, ammo, true), 1832.5);
  assert.equal(kitCost([], ammo), 0);
  assert.equal(kitCost(["unknown"], {}), 0);
  assert.equal(kitCost(["wd-ak74"], { "wd-ak74": -3 }), 1600);
});
test("TTK counts intervals from the first hit and updates with target health", () => {
  assert.equal(timeToKill(28, 800, 100), 225);
  assert.ok(Math.abs(timeToKill(26, 650, 200) - 646.153846) < 0.001);
  assert.equal(timeToKill(55, 600, 50), 0);
});
test("Published catalog is unique and factual values carry row-level provenance", () => {
  assert.equal(new Set(entities.map((e) => e.id)).size, entities.length);
  assert.equal(equipment.length, 19);
  assert.equal(weapons.length, 13);
  assert.equal(
    entities.filter((e) => e.entity_type === "creatures").length,
    24,
  );
  for (const e of entities) {
    assert.match(e.source_url, /^https:\/\//);
    assert.ok(e.game_version);
    assert.ok(e.verified_at);
  }
  for (const p of presets) {
    const entries = p.items.map((id) => equipment.find((e) => e.id === id)!);
    assert.ok(entries.every(Boolean));
    assert.equal(
      new Set(entries.map((e) => e.data_json.slot)).size,
      entries.length,
    );
  }
});
