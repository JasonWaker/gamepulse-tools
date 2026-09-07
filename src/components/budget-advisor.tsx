"use client";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { equipment, kitCost, money, stat } from "@/lib/equipment";
import {
  recommendBudget,
  cheaperAlternatives,
  type BudgetInput,
} from "@/lib/budget";
export type BudgetPreferences = Pick<
  BudgetInput,
  "rebuys" | "locked" | "sameClass" | "minRange" | "minSeats" | "strategy"
>;
export const budgetDefaults: BudgetPreferences = {
  rebuys: 1,
  locked: [],
  sameClass: true,
  minRange: 0,
  minSeats: 1,
  strategy: "fewest",
};
export function BudgetAdvisor({
  input,
  onPreferences,
  onApply,
}: {
  input: BudgetInput;
  onPreferences: (value: Partial<BudgetPreferences>) => void;
  onApply: (ids: string[], ammo: Record<string, number>) => void;
}) {
  const [undo, setUndo] = useState<{
    ids: string[];
    ammo: Record<string, number>;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const proposal = recommendBudget(input);
  const total = kitCost(input.ids, input.ammo, input.discount);
  const selected = equipment.filter((e) => input.ids.includes(e.id));
  const apply = (ids: string[], ammo: Record<string, number>) => {
    setUndo({ ids: input.ids, ammo: input.ammo });
    onApply(ids, ammo);
    setNotice(
      "Updated your kit. Review it in the budget panel, or undo below.",
    );
  };
  return (
    <section
      id="budget-advisor"
      className="budget-advisor"
      aria-labelledby="advisor-title"
    >
      <div className="advisor-intro">
        <small className="overline">
          <Sparkles size={14} /> SPEND LESS. STAY IN THE FIGHT.
        </small>
        <h2 id="advisor-title">Make room for another run.</h2>
        <p>
          Keep your equipped slots. Lock the essentials. Find a kit that leaves
          enough cash to buy it again.
        </p>
      </div>
      <div className="advisor-controls">
        <label>
          Full rebuys to reserve
          <input
            aria-label="Full rebuys to reserve"
            type="number"
            min={0}
            max={10}
            value={input.rebuys}
            onChange={(e) =>
              onPreferences({
                rebuys: Math.min(
                  10,
                  Math.max(0, Math.floor(Number(e.target.value))),
                ),
              })
            }
          />
        </label>
        <label>
          Recommendation priority
          <select
            aria-label="Recommendation priority"
            value={input.strategy}
            onChange={(e) =>
              onPreferences({
                strategy: e.target.value as BudgetInput["strategy"],
              })
            }
          >
            <option value="fewest">Change as few items as possible</option>
            <option value="cheapest">Lowest total cost</option>
          </select>
        </label>
        <label>
          Primary effective range ≥
          <select
            aria-label="Minimum primary range"
            value={input.minRange}
            onChange={(e) =>
              onPreferences({ minRange: Number(e.target.value) })
            }
          >
            {[0, 100, 200, 300, 500, 700].map((n) => (
              <option value={n} key={n}>
                {n === 0 ? "Any recorded range" : `${n} m`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vehicle seats ≥
          <select
            aria-label="Minimum vehicle seats"
            value={input.minSeats}
            onChange={(e) =>
              onPreferences({ minSeats: Number(e.target.value) })
            }
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="discount-control">
        <input
          type="checkbox"
          checked={input.sameClass}
          onChange={(e) => onPreferences({ sameClass: e.target.checked })}
        />{" "}
        Keep the same equipment category
      </label>
      <div className="lock-list" aria-label="Keep equipped items">
        {selected.map((e) => (
          <button
            key={e.id}
            aria-pressed={input.locked.includes(e.id)}
            className={input.locked.includes(e.id) ? "active" : ""}
            onClick={() =>
              onPreferences({
                locked: input.locked.includes(e.id)
                  ? input.locked.filter((id) => id !== e.id)
                  : [...input.locked, e.id],
              })
            }
          >
            <LockKeyhole size={13} />
            {e.name}
          </button>
        ))}
      </div>
      <p className="source-note">
        Locked items stay unchanged, even when they fall below the range or seat
        preference. Ammo box counts stay the same per slot. Recommendations use
        listed prices, not a combat-strength rating.
      </p>
      <div className="advisor-result" aria-live="polite">
        {!proposal ? (
          <p>
            {selected.length
              ? "No combination matches these filters. Lower the range or seat requirement, or allow other categories."
              : "Equip at least one item to get a recommendation."}
          </p>
        ) : (
          <>
            <div className="advisor-metrics">
              <div>
                <small>PER-RUN LIMIT</small>
                <strong>{money(proposal.ceiling)}</strong>
              </div>
              <div>
                <small>PROPOSED KIT</small>
                <strong data-testid="proposed-cost">
                  {money(proposal.cost)}
                </strong>
              </div>
              <div>
                <small>
                  {total >= proposal.cost ? "SAVE PER RUN" : "EXTRA PER RUN"}
                </small>
                <strong
                  className={total >= proposal.cost ? "positive" : "danger"}
                >
                  {money(Math.abs(total - proposal.cost))}
                </strong>
              </div>
            </div>
            <p className={proposal.fits ? "positive" : "danger"}>
              {proposal.fits
                ? `Covers this deployment + ${input.rebuys} full rebuys.`
                : `No kit fits these constraints. Cheapest option still needs ${money(proposal.cost * (input.rebuys + 1) - input.budget)} more cash across all runs.`}
            </p>
            {proposal.changes.map((c) => (
              <div className="swap-row" key={c.from.id}>
                <span>{c.from.name}</span>
                <ArrowRight size={15} />
                <strong>{c.to.name}</strong>
                <small>
                  {c.to.entity_type === "weapons"
                    ? `${stat(c.to, "damage")} DMG · ${stat(c.to, "range")} m`
                    : c.to.entity_type === "vehicles"
                      ? `${stat(c.to, "seats")} seats`
                      : String(c.to.data_json.category)}
                </small>
              </div>
            ))}
            {!proposal.changes.length && (
              <p>Your current kit is the selected recommendation.</p>
            )}
            <button
              className="button primary"
              disabled={!proposal.fits || !proposal.changes.length}
              onClick={() => apply(proposal.ids, proposal.ammo)}
            >
              Apply recommended kit <ArrowRight size={15} />
            </button>
          </>
        )}
      </div>
      <div className="advisor-alternatives">
        <h3>Lower-price alternatives</h3>
        <p>
          Compare trade-offs before replacing one item. Savings include your
          current ammo quantity and discount.
        </p>
        {selected.map((e) => {
          const alternatives = cheaperAlternatives(e, input);
          return (
            <div className="alternative-group" key={e.id}>
              <h4>
                {e.name} <small>{e.data_json.slot}</small>
              </h4>
              {alternatives.length ? (
                alternatives.map((x) => (
                  <div className="alternative-row" key={x.entity.id}>
                    <div>
                      <strong>{x.entity.name}</strong>
                      <small>
                        {x.entity.entity_type === "weapons"
                          ? `Damage ${stat(e, "damage")} → ${stat(x.entity, "damage")} · Range ${stat(e, "range")} → ${stat(x.entity, "range")} m`
                          : x.entity.entity_type === "vehicles"
                            ? `Seats ${stat(e, "seats")} → ${stat(x.entity, "seats")}`
                            : "Same equipment category"}
                      </small>
                    </div>
                    <b className="positive">Save {money(x.saving)}</b>
                    <button
                      className="button secondary"
                      aria-label={`Replace ${e.name} with ${x.entity.name}`}
                      onClick={() =>
                        apply(
                          input.ids.map((id) =>
                            id === e.id ? x.entity.id : id,
                          ),
                          {
                            ...input.ammo,
                            [x.entity.id]: input.ammo[e.id] || 0,
                          },
                        )
                      }
                    >
                      Replace
                    </button>
                  </div>
                ))
              ) : (
                <p className="source-note">
                  {input.locked.includes(e.id)
                    ? "Locked — unlock to see alternatives."
                    : "No cheaper match in the current catalog under these filters."}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {undo && (
        <button
          className="button secondary"
          onClick={() => {
            onApply(undo.ids, undo.ammo);
            setUndo(null);
            setNotice("Previous equipment and ammo restored.");
          }}
        >
          Undo last replacement
        </button>
      )}
      <p role="status">{notice}</p>
    </section>
  );
}
