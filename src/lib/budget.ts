import { equipment, kitCost, stat } from "./equipment";
import type { Entity } from "./registry";
export type BudgetInput = {
  ids: string[];
  ammo: Record<string, number>;
  budget: number;
  discount: boolean;
  rebuys: number;
  locked: string[];
  sameClass: boolean;
  minRange: number;
  minSeats: number;
  strategy: "fewest" | "cheapest";
};
export type BudgetProposal = {
  ids: string[];
  ammo: Record<string, number>;
  cost: number;
  changes: { from: Entity; to: Entity }[];
  fits: boolean;
  ceiling: number;
};
export function budgetOptions(
  current: Entity,
  input: BudgetInput,
  pool = equipment,
) {
  if (input.locked.includes(current.id)) return [current];
  return pool.filter(
    (e) =>
      e.game_id === current.game_id &&
      e.data_json.slot === current.data_json.slot &&
      (!input.sameClass ||
        e.data_json.category === current.data_json.category) &&
      (e.data_json.slot !== "Primary" || stat(e, "range") >= input.minRange) &&
      (e.data_json.slot !== "Vehicle" || stat(e, "seats") >= input.minSeats),
  );
}
/** Exhaustive slot combinations; no damage-based score or invented effectiveness ranking. */
export function recommendBudget(
  input: BudgetInput,
  pool = equipment,
): BudgetProposal | null {
  const current = input.ids
    .map((id) => pool.find((e) => e.id === id))
    .filter((e): e is Entity => !!e);
  if (!current.length) return null;
  const ceiling =
    Math.max(0, input.budget) /
    (1 + Math.min(10, Math.max(0, Math.floor(input.rebuys))));
  const choices = current.map((e) => budgetOptions(e, input, pool));
  if (choices.some((xs) => !xs.length)) return null;
  let best: BudgetProposal | null = null;
  function visit(index: number, chosen: Entity[]) {
    if (index < choices.length) {
      for (const e of choices[index]) visit(index + 1, [...chosen, e]);
      return;
    }
    const ids = chosen.map((e) => e.id);
    const ammo = Object.fromEntries(
      chosen.map((e, i) => [
        e.id,
        Math.min(99, Math.max(0, Math.floor(input.ammo[current[i].id] || 0))),
      ]),
    );
    // Use the same cost rule as the visible kit, including replacement-specific ammo prices.
    const cost =
      chosen.reduce(
        (sum, e) => sum + stat(e, "price") + stat(e, "ammo_price") * ammo[e.id],
        0,
      ) * (input.discount ? 0.5 : 1);
    const changes = chosen.flatMap((e, i) =>
      e.id === current[i].id ? [] : [{ from: current[i], to: e }],
    );
    const proposal = {
      ids,
      ammo,
      cost,
      changes,
      ceiling,
      fits: cost <= ceiling + 1e-8,
    };
    const better =
      !best ||
      (proposal.fits && !best.fits) ||
      (proposal.fits === best.fits &&
        (input.strategy === "fewest" && proposal.fits
          ? changes.length < best.changes.length ||
            (changes.length === best.changes.length && cost < best.cost)
          : cost < best.cost ||
            (cost === best.cost && changes.length < best.changes.length)));
    if (better) best = proposal;
  }
  visit(0, []);
  return best;
}
export function cheaperAlternatives(current: Entity, input: BudgetInput) {
  const boxes = input.ammo[current.id] || 0;
  const oldCost = kitCost(
    [current.id],
    { [current.id]: boxes },
    input.discount,
  );
  return budgetOptions(current, input)
    .filter((e) => e.id !== current.id)
    .map((e) => ({
      entity: e,
      saving: oldCost - kitCost([e.id], { [e.id]: boxes }, input.discount),
    }))
    .filter((x) => x.saving > 0)
    .sort((a, b) => b.saving - a.saving)
    .slice(0, 3);
}
