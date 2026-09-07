import { test } from "node:test";
import assert from "node:assert/strict";
import { loadoutTotal, ttk, grind, progress } from "../src/lib/calculations";
import { canDisplay, media } from "../src/lib/media";
test("loadout warns on overbudget and rejects nonfinite costs", () => {
  assert.deepEqual(loadoutTotal([300, 200, NaN, -30], 400), {
    total: 500,
    remaining: -100,
    over: true,
    percent: 100,
  });
  assert.equal(loadoutTotal([10], 0).percent, 100);
});
test("TTK counts time between shots, not first shot", () => {
  assert.equal(ttk(25, 600, 100), 0.3);
  assert.equal(ttk(100, 600, 100), 0);
  assert.equal(ttk(0, 600, 100), null);
  assert.equal(ttk(20, 0, 100), null);
});
test("grind calculates observed rates with boost and reached target", () => {
  assert.deepEqual(grind(100, 500, 100, 2), {
    remaining: 400,
    base: 4,
    boosted: 2,
    saved: 2,
  });
  assert.equal(grind(500, 100, 10, 2)?.remaining, 0);
  assert.equal(grind(0, 100, 0, 2), null);
  assert.equal(grind(0, 100, 20, 0.5), null);
});
test("progress is clamped and focuses least complete personal goal", () => {
  assert.deepEqual(progress([80, 20, 60, 100]), { average: 65, focus: 1 });
  assert.deepEqual(progress([-10, 150]), { average: 50, focus: 0 });
});
test("unreviewed game assets never render", () => {
  for (const m of media)
    assert.equal(
      canDisplay(m),
      ["approved", "embed_only"].includes(m.rights_status),
    );
  assert.equal(canDisplay({ ...media[0], rights_status: "rejected" }), false);
});
