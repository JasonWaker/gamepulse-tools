"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  X,
  Save,
  Share2,
  RotateCcw,
  Bookmark,
  Check,
  ArrowUpRight,
  Grid2X2,
  List,
  Minus,
  ShieldCheck,
} from "lucide-react";
import {
  entities,
  gameEntities,
  tools,
  toolHref,
  type Entity,
  type ToolDefinition,
} from "@/lib/registry";
import {
  equipment,
  weapons,
  slots,
  presets,
  stat,
  money,
  kitCost,
  timeToKill,
} from "@/lib/equipment";
import { DataStatus } from "./data-status";
import { EntityArt } from "./catalog-art";
import { track } from "@/lib/analytics";
import {
  BudgetAdvisor,
  budgetDefaults,
  type BudgetPreferences,
} from "./budget-advisor";
type Plan = {
  budgetPreferences: BudgetPreferences;
  ids: string[];
  ammo: Record<string, number>;
  budget: number;
  discount: boolean;
  compare: string[];
  health: number;
  team: string[];
  name: string;
  milestones: number[];
  sessions: { date: string; value: number }[];
  estimate: {
    current: number;
    target: number;
    rate: number;
    multiplier: number;
  };
};
const defaults: Plan = {
  budgetPreferences: budgetDefaults,
  ids: presets[0].items,
  ammo: { "wd-ak74": 3, "wd-m1911": 2 },
  budget: 10000,
  discount: false,
  compare: ["wd-ak74", "wd-m4"],
  health: 100,
  team: [],
  name: "My field kit",
  milestones: [0, 0, 0, 0],
  sessions: [],
  estimate: { current: 0, target: 0, rate: 0, multiplier: 1 },
};
function cleanPlan(raw: unknown): Plan {
  const x = (raw && typeof raw === "object" ? raw : {}) as Partial<Plan>;
  const valid = (xs: unknown, allowed: string[], max: number) =>
    Array.isArray(xs)
      ? [
          ...new Set(
            xs.filter((v) => typeof v === "string" && allowed.includes(v)),
          ),
        ].slice(0, max)
      : [];
  const ids = valid(
    x.ids,
    equipment.map((e) => e.id),
    slots.length,
  ).filter(
    (id, i, all) =>
      all.findIndex(
        (k) =>
          equipment.find((e) => e.id === k)?.data_json.slot ===
          equipment.find((e) => e.id === id)?.data_json.slot,
      ) === i,
  );
  const ammo: Record<string, number> = {};
  for (const e of equipment) {
    const n = Number(x.ammo?.[e.id]);
    if (Number.isFinite(n))
      ammo[e.id] = Math.min(99, Math.max(0, Math.floor(n)));
  }
  return {
    budgetPreferences: {
      rebuys: Math.min(
        10,
        Math.max(
          0,
          Math.floor(
            Number(x.budgetPreferences?.rebuys ?? budgetDefaults.rebuys) || 0,
          ),
        ),
      ),
      locked: valid(
        x.budgetPreferences?.locked,
        equipment.map((e) => e.id),
        slots.length,
      ),
      sameClass: x.budgetPreferences?.sameClass !== false,
      minRange: [0, 100, 200, 300, 500, 700].includes(
        Number(x.budgetPreferences?.minRange),
      )
        ? Number(x.budgetPreferences?.minRange)
        : 0,
      minSeats: [1, 2, 3, 4].includes(Number(x.budgetPreferences?.minSeats))
        ? Number(x.budgetPreferences?.minSeats)
        : 1,
      strategy:
        x.budgetPreferences?.strategy === "cheapest" ? "cheapest" : "fewest",
    },
    ids,
    ammo,
    budget:
      typeof x.budget === "number" && Number.isFinite(x.budget)
        ? Math.min(100000000, Math.max(0, x.budget))
        : 10000,
    discount: x.discount === true,
    compare: valid(
      x.compare,
      weapons.map((e) => e.id),
      3,
    ),
    health:
      typeof x.health === "number" && Number.isFinite(x.health)
        ? Math.min(500, Math.max(1, x.health))
        : 100,
    team: valid(
      x.team,
      entities.filter((e) => e.entity_type === "creatures").map((e) => e.id),
      4,
    ),
    milestones: Array.from({ length: 4 }, (_, i) =>
      Math.min(100, Math.max(0, Number(x.milestones?.[i]) || 0)),
    ),
    sessions: Array.isArray(x.sessions)
      ? x.sessions
          .filter((v) => typeof v.date === "string" && Number.isFinite(v.value))
          .slice(-20)
          .map((v) => ({
            date: v.date.slice(0, 30),
            value: Math.min(100, Math.max(0, v.value)),
          }))
      : [],
    estimate: {
      current: Math.min(1e8, Math.max(0, Number(x.estimate?.current) || 0)),
      target: Math.min(1e8, Math.max(0, Number(x.estimate?.target) || 0)),
      rate: Math.min(1e8, Math.max(0, Number(x.estimate?.rate) || 0)),
      multiplier: Math.min(
        1000,
        Math.max(1, Number(x.estimate?.multiplier) || 1),
      ),
    },
    name: typeof x.name === "string" ? x.name.slice(0, 60) : "My plan",
  };
}
function readLocal<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => {
      const x = readLocal<unknown>("gp:favorites", []);
      setFavorites(
        Array.isArray(x) ? x.filter((v) => typeof v === "string") : [],
      );
    };
    queueMicrotask(sync);
    window.addEventListener("gp:favorites-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gp:favorites-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const toggle = (id: string) => {
    const stored = readLocal<unknown>("gp:favorites", favorites);
    const old = Array.isArray(stored)
      ? stored.filter((v) => typeof v === "string")
      : favorites;
    const next = old.includes(id) ? old.filter((x) => x !== id) : [...old, id];
    setFavorites(next);
    try {
      localStorage.setItem("gp:favorites", JSON.stringify(next));
      window.dispatchEvent(new Event("gp:favorites-updated"));
    } catch {}
  };
  return { favorites, toggle };
}
export function Catalog({
  records,
  mode = "browse",
  selected = [],
  onPick,
}: {
  records: Entity[];
  mode?: "browse" | "pick";
  selected?: string[];
  onPick?: (e: Entity) => void;
}) {
  const [q, setQ] = useState(""),
    [category, setCategory] = useState("All"),
    [sort, setSort] = useState("name"),
    [list, setList] = useState(false),
    [onlySaved, setOnlySaved] = useState(false);
  const { favorites, toggle } = useFavorites();
  const categories = [
    ...new Set(
      records.flatMap((e) =>
        String(e.data_json.category || e.data_json.type || "Other").split(
          " / ",
        ),
      ),
    ),
  ];
  const filtered = records
    .filter(
      (e) =>
        (e.name + " " + e.data_json.role + " " + e.data_json.type)
          .toLowerCase()
          .includes(q.toLowerCase()) &&
        (category === "All" ||
          String(e.data_json.category || e.data_json.type)
            .split(" / ")
            .includes(category)) &&
        (!onlySaved || favorites.includes(e.id)),
    )
    .sort((a, b) =>
      sort === "price"
        ? stat(a, "price") - stat(b, "price")
        : sort === "damage"
          ? stat(b, "damage") - stat(a, "damage")
          : a.name.localeCompare(b.name),
    );
  return (
    <div className="catalog">
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={17} />
          <input
            aria-label="Search records"
            value={q}
            placeholder="Search name, type or role…"
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Sort records"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Name A–Z</option>
          {records.some((e) => typeof e.data_json.price === "number") && (
            <>
              <option value="price">Price: low first</option>
              <option value="damage">Damage: high first</option>
            </>
          )}
        </select>
        <button
          className={`icon-button ${onlySaved ? "active" : ""}`}
          aria-label="Only favorites"
          aria-pressed={onlySaved}
          onClick={() => setOnlySaved(!onlySaved)}
        >
          <Bookmark size={17} />
        </button>
        <button
          className="icon-button"
          aria-label={list ? "Show grid" : "Show list"}
          onClick={() => setList(!list)}
        >
          {list ? <Grid2X2 size={18} /> : <List size={18} />}
        </button>
      </div>
      <div className="catalog-meta">
        <span>{filtered.length} records</span>
        <span>
          {records[0]?.entity_type === "creatures"
            ? "Official types & roles · element emblems"
            : "Beta data · original equipment illustrations"}
        </span>
      </div>
      <div className={`catalog-grid ${list ? "catalog-list" : ""}`}>
        {filtered.map((e) => (
          <article
            className={`catalog-card ${selected.includes(e.id) ? "is-selected" : ""}`}
            key={e.id}
          >
            <div className="catalog-art-wrap">
              <Link
                href={`/games/${e.game_id}/${e.entity_type}/${e.slug}`}
                aria-label={`View ${e.name}`}
              >
                <EntityArt entity={e} />
              </Link>
              <button
                className={`favorite-button ${favorites.includes(e.id) ? "active" : ""}`}
                aria-label={`${favorites.includes(e.id) ? "Unfavorite" : "Favorite"} ${e.name}`}
                onClick={() => toggle(e.id)}
              >
                <Bookmark
                  size={16}
                  fill={favorites.includes(e.id) ? "currentColor" : "none"}
                />
              </button>
              {selected.includes(e.id) && (
                <span className="selected-label">
                  <Check size={12} /> SELECTED
                </span>
              )}
            </div>
            <div className="catalog-card-body">
              <small>{String(e.data_json.category || e.data_json.type)}</small>
              <Link href={`/games/${e.game_id}/${e.entity_type}/${e.slug}`}>
                <h3>
                  {e.name}
                  <ArrowUpRight size={15} />
                </h3>
              </Link>
              {e.entity_type === "creatures" ? (
                <p className="creature-role">
                  {String(e.data_json.role)}{" "}
                  <span>Stage {e.data_json.stage}</span>
                </p>
              ) : (
                <div className="card-stats">
                  {e.data_json.damage && (
                    <span>
                      DMG <b>{e.data_json.damage}</b>
                    </span>
                  )}
                  {e.data_json.rpm && (
                    <span>
                      RPM <b>{e.data_json.rpm}</b>
                    </span>
                  )}
                  <strong>{money(stat(e, "price"))}</strong>
                </div>
              )}
              {mode === "pick" ? (
                <button
                  className={`card-action ${selected.includes(e.id) ? "selected" : ""}`}
                  onClick={() => onPick?.(e)}
                >
                  {selected.includes(e.id) ? (
                    <Check size={14} />
                  ) : (
                    <Plus size={14} />
                  )}{" "}
                  {selected.includes(e.id)
                    ? "Remove"
                    : e.entity_type === "creatures"
                      ? "Add to team"
                      : "Equip"}
                </button>
              ) : (
                <Link
                  className="card-action"
                  href={`${toolHref(tools.find((t) => t.game_id === e.game_id)!)}?item=${e.id}`}
                >
                  <Plus size={14} />
                  {e.entity_type === "creatures"
                    ? "Add to team"
                    : "Add to loadout"}
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty">
          <Search />
          <h3>No records match</h3>
          <p>Try another search or clear the filters.</p>
          <button
            onClick={() => {
              setQ("");
              setCategory("All");
              setOnlySaved(false);
            }}
            className="button secondary"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
export function PlayerWorkbench({ tool }: { tool: ToolDefinition }) {
  const [plan, setPlan] = useState<Plan>(defaults),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState(""),
    [slot, setSlot] = useState("Primary");
  const patch = (p: Partial<Plan>) => setPlan((old) => ({ ...old, ...p }));
  useEffect(() => {
    queueMicrotask(() => {
      let p = {
        ...defaults,
        name:
          tool.tool_type === "loadout"
            ? "My field kit"
            : tool.tool_type === "team"
              ? "My adventure team"
              : tool.name,
      };
      const stored = readLocal<unknown>("gp:v2:" + tool.id, null);
      if (stored) p = cleanPlan(stored);
      try {
        if (location.hash.startsWith("#plan="))
          p = cleanPlan(JSON.parse(decodeURIComponent(location.hash.slice(6))));
      } catch {
        setNotice(
          "This shared plan could not be read. Your local plan is still available.",
        );
      }
      const params = new URLSearchParams(location.search);
      const preset = presets.find((x) => x.id === params.get("preset"));
      if (preset)
        p = {
          ...p,
          ids: preset.items,
          ammo: Object.fromEntries(preset.items.map((id) => [id, 3])),
          name: preset.name,
        };
      const item = entities.find((e) => e.id === params.get("item"));
      if (item) {
        if (item.entity_type === "creatures")
          p = { ...p, team: [...new Set([...p.team, item.id])].slice(-4) };
        else {
          p = {
            ...p,
            ids: [
              ...p.ids.filter(
                (id) =>
                  equipment.find((e) => e.id === id)?.data_json.slot !==
                  item.data_json.slot,
              ),
              item.id,
            ],
            compare:
              item.entity_type === "weapons"
                ? [item.id, ...p.compare.filter((id) => id !== item.id)].slice(
                    0,
                    2,
                  )
                : p.compare,
          };
          setSlot(String(item.data_json.slot));
        }
      }
      setPlan(p);
      setReady(true);
      track("tool_view", tool.id);
      const recent = readLocal<string[]>("gp:recent", []);
      try {
        localStorage.setItem(
          "gp:recent",
          JSON.stringify(
            [
              tool.id,
              ...(Array.isArray(recent) ? recent : []).filter(
                (x) => x !== tool.id,
              ),
            ].slice(0, 5),
          ),
        );
      } catch {}
    });
  }, [tool.id, tool.name, tool.tool_type]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("gp:v2:" + tool.id, JSON.stringify(plan));
      } catch {}
  }, [ready, tool.id, plan]);
  const save = () => {
    try {
      const old = readLocal<Saved[]>("gp:saved", []);
      const entry = {
        id: Date.now().toString(36),
        tool: tool.id,
        name: plan.name || tool.name,
        plan,
        date: new Date().toISOString(),
      };
      localStorage.setItem(
        "gp:saved",
        JSON.stringify(
          [entry, ...(Array.isArray(old) ? old : [])].slice(0, 30),
        ),
      );
      setNotice("Saved to My toolkit.");
      track("tool_complete", tool.id, { completion: "explicit_save" });
    } catch {
      setNotice("Browser storage is unavailable. Use Share to keep a copy.");
    }
  };
  const share = async () => {
    const url = new URL(location.href);
    url.search = "";
    url.hash = "plan=" + encodeURIComponent(JSON.stringify(plan));
    try {
      await navigator.clipboard.writeText(url.href);
      setNotice("Plan link copied.");
      track("tool_share", tool.id);
    } catch {
      setNotice("Copy your plan link from the address bar.");
      history.replaceState(null, "", url);
    }
  };
  const equip = (e: Entity) => {
    const selected = plan.ids.includes(e.id);
    patch({
      ids: selected
        ? plan.ids.filter((id) => id !== e.id)
        : [
            ...plan.ids.filter(
              (id) =>
                equipment.find((x) => x.id === id)?.data_json.slot !==
                e.data_json.slot,
            ),
            e.id,
          ],
      ammo: { ...plan.ammo, [e.id]: plan.ammo[e.id] ?? 3 },
    });
  };
  const total = kitCost(plan.ids, plan.ammo, plan.discount),
    remaining = plan.budget - total;
  return (
    <div className="player-workbench" data-ready={ready}>
      <div className="workbench-actions">
        <label className="plan-name">
          <span>PLAN NAME</span>
          <input
            aria-label="Plan name"
            maxLength={60}
            value={plan.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </label>
        <span className="autosave">
          <ShieldCheck size={13} /> Auto-saved on this device
        </span>
        <button className="button secondary" onClick={save}>
          <Save size={15} />
          Save plan
        </button>
        <button className="button secondary" onClick={share}>
          <Share2 size={15} />
          Share
        </button>
        <button
          className="icon-button"
          aria-label="Reset plan"
          onClick={() => {
            setPlan({ ...defaults, ids: [], team: [], name: "My plan" });
            history.replaceState(null, "", location.pathname);
            setNotice("Plan reset.");
          }}
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <div role="status" className={`tool-notice ${notice ? "visible" : ""}`}>
        {notice}
      </div>
      {tool.tool_type === "loadout" && (
        <>
          <DataStatus
            records={equipment.filter((e) => e.game_id === tool.game_id)}
          />
          <div className="preset-selector">
            <span>START WITH A BUILD</span>
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  patch({
                    ids: p.items,
                    ammo: Object.fromEntries(p.items.map((id) => [id, 3])),
                    name: p.name,
                  });
                  setNotice(`${p.name} loaded.`);
                }}
              >
                {p.name}
                <ArrowUpRight size={13} />
              </button>
            ))}
          </div>
          <div className="builder-layout">
            <section>
              <div className="slot-tabs" aria-label="Equipment slots">
                {slots.map((s) => (
                  <button
                    key={s}
                    className={slot === s ? "active" : ""}
                    aria-pressed={slot === s}
                    onClick={() => setSlot(s)}
                  >
                    {s}
                    <span>
                      {plan.ids.some(
                        (id) =>
                          equipment.find((e) => e.id === id)?.data_json.slot ===
                          s,
                      )
                        ? "1"
                        : "0"}
                    </span>
                  </button>
                ))}
              </div>
              <Catalog
                key={slot}
                records={equipment.filter(
                  (e) =>
                    e.game_id === tool.game_id && e.data_json.slot === slot,
                )}
                mode="pick"
                selected={plan.ids}
                onPick={equip}
              />
            </section>
            <aside className="budget-panel">
              <div className="budget-heading">
                <small>DEPLOYMENT BUDGET</small>
                <span>USD / GAME CASH</span>
              </div>
              <label className="budget-input">
                Your cash
                <input
                  aria-label="Your cash"
                  type="number"
                  min={0}
                  max={100000000}
                  value={plan.budget}
                  onChange={(e) =>
                    patch({
                      budget: Math.min(
                        100000000,
                        Math.max(0, Number(e.target.value)),
                      ),
                    })
                  }
                />
              </label>
              <label className="discount-control">
                <input
                  type="checkbox"
                  checked={plan.discount}
                  onChange={(e) => patch({ discount: e.target.checked })}
                />
                Recruit discount −50% <small>Beta · below level 9</small>
              </label>
              <div className="budget-totals">
                <span>
                  Kit cost<strong data-testid="kit-cost">{money(total)}</strong>
                </span>
                <span className={remaining < 0 ? "danger" : "positive"}>
                  Remaining
                  <strong data-testid="remaining">{money(remaining)}</strong>
                </span>
              </div>
              <div className="budget-meter">
                <i
                  style={{
                    width: `${Math.min(100, plan.budget ? (total / plan.budget) * 100 : 100)}%`,
                    background: remaining < 0 ? "#fa7878" : undefined,
                  }}
                />
              </div>
              <p className={remaining < 0 ? "danger" : "rebuy"}>
                {remaining < 0
                  ? `Over budget by ${money(-remaining)}`
                  : total
                    ? `${Math.floor(remaining / total)} full rebuys after this deployment`
                    : "Select equipment to build your kit"}
              </p>
              <a className="button secondary" href="#budget-advisor">
                Find a cheaper kit ↘
              </a>
              <div className="kit-items">
                {slots.map((s) => {
                  const e = equipment.find(
                    (e) => plan.ids.includes(e.id) && e.data_json.slot === s,
                  );
                  return (
                    <div className="kit-item" key={s}>
                      {e ? (
                        <>
                          <div className="kit-row">
                            <EntityArt entity={e} />
                            <div>
                              <small>{s}</small>
                              <strong>{e.name}</strong>
                            </div>
                            <b>
                              {money(
                                stat(e, "price") * (plan.discount ? 0.5 : 1),
                              )}
                            </b>
                            <button
                              className="icon-button"
                              aria-label={`Remove ${e.name}`}
                              onClick={() => equip(e)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {stat(e, "ammo_price") > 0 && (
                            <div className="ammo-row">
                              <span>
                                Standard ammo
                                <small>
                                  {money(
                                    stat(e, "ammo_price") *
                                      (plan.discount ? 0.5 : 1),
                                  )}{" "}
                                  / box
                                </small>
                              </span>
                              <button
                                aria-label={`Less ammo for ${e.name}`}
                                disabled={!plan.ammo[e.id]}
                                onClick={() =>
                                  patch({
                                    ammo: {
                                      ...plan.ammo,
                                      [e.id]: Math.max(
                                        0,
                                        (plan.ammo[e.id] || 0) - 1,
                                      ),
                                    },
                                  })
                                }
                              >
                                <Minus size={12} />
                              </button>
                              <b>{plan.ammo[e.id] || 0}</b>
                              <button
                                aria-label={`More ammo for ${e.name}`}
                                disabled={plan.ammo[e.id] >= 99}
                                onClick={() =>
                                  patch({
                                    ammo: {
                                      ...plan.ammo,
                                      [e.id]: Math.min(
                                        99,
                                        (plan.ammo[e.id] || 0) + 1,
                                      ),
                                    },
                                  })
                                }
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          className="empty-slot"
                          onClick={() => setSlot(s)}
                        >
                          <Plus size={18} />
                          <span>Add {s.toLowerCase()}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="source-note">
                Community-recorded beta prices. Attachments and unlisted
                supplies are excluded.{" "}
                <a href="https://wardogshq.gg/builds/">Source ↗</a>
              </p>
            </aside>
          </div>
          <BudgetAdvisor
            input={{ ...plan, ...plan.budgetPreferences }}
            onPreferences={(value) =>
              patch({
                budgetPreferences: { ...plan.budgetPreferences, ...value },
              })
            }
            onApply={(ids, ammo) => patch({ ids, ammo })}
          />
        </>
      )}
      {(tool.tool_type === "progress" || tool.tool_type === "pass") && (
        <ProgressWorkspace
          tool={tool}
          plan={plan}
          patch={patch}
          notify={setNotice}
        />
      )}
      {tool.tool_type === "comparator" && <Compare plan={plan} patch={patch} />}
      {tool.tool_type === "team" && (
        <div className="team-workspace">
          <div className="team-rack">
            {Array.from({ length: 4 }, (_, i) => {
              const e = entities.find((e) => e.id === plan.team[i]);
              return (
                <div className="team-position" key={i}>
                  <span className="position-label">COMPANION 0{i + 1}</span>
                  {e ? (
                    <>
                      <EntityArt entity={e} />
                      <strong>{e.name}</strong>
                      <small>
                        {String(e.data_json.type)} · {String(e.data_json.role)}
                      </small>
                      <button
                        className="icon-button"
                        aria-label={`Remove ${e.name}`}
                        onClick={() =>
                          patch({ team: plan.team.filter((id) => id !== e.id) })
                        }
                      >
                        <X size={15} />
                      </button>
                    </>
                  ) : (
                    <div className="team-empty">
                      <Plus />
                      <span>Choose a companion below</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="coverage-panel">
            <div>
              <small>TEAM OVERVIEW</small>
              <h3>{plan.team.length} / 4 planning slots</h3>
            </div>
            <div>
              <small>ELEMENT VARIETY</small>
              <strong>
                {[
                  ...new Set(
                    plan.team.flatMap((id) =>
                      String(
                        entities.find((e) => e.id === id)?.data_json.type,
                      ).split(" / "),
                    ),
                  ),
                ].join(" · ") || "Choose your first companion"}
              </strong>
            </div>
            <div>
              <small>ROLE COVERAGE</small>
              <strong>
                {[
                  ...new Set(
                    plan.team.map(
                      (id) => entities.find((e) => e.id === id)?.data_json.role,
                    ),
                  ),
                ].join(" · ") || "No roles yet"}
              </strong>
            </div>
          </div>
          <p className="source-note">
            Four slots are a personal planning layout, not a verified in-game
            party limit. Coverage shows variety, not combat synergy. Images are
            original element emblems.
          </p>
          <Catalog
            records={gameEntities(tool.game_id)}
            mode="pick"
            selected={plan.team}
            onPick={(e) => {
              if (plan.team.includes(e.id))
                patch({ team: plan.team.filter((id) => id !== e.id) });
              else if (plan.team.length < 4)
                patch({ team: [...plan.team, e.id] });
              else
                setNotice(
                  "Your four planning slots are full. Remove a companion to add another.",
                );
            }}
          />
        </div>
      )}
    </div>
  );
}
function ProgressWorkspace({
  tool,
  plan,
  patch,
  notify,
}: {
  tool: ToolDefinition;
  plan: Plan;
  patch: (p: Partial<Plan>) => void;
  notify: (m: string) => void;
}) {
  const average = plan.milestones.reduce((a, b) => a + b, 0) / 4;
  const labels = (tool.config_json.stats as string[]) || [
    "Height",
    "Face",
    "Frame",
    "Bodyfat",
  ];
  const e = plan.estimate,
    remaining = Math.max(0, e.target - e.current),
    base = e.rate > 0 ? remaining / e.rate : 0,
    boosted = base / e.multiplier;
  return tool.tool_type === "progress" ? (
    <div className="progress-layout">
      <section className="progress-controls">
        <small className="overline">PERSONAL MILESTONES</small>
        <h2>One session closer.</h2>
        <p>
          Track how close you are to your own targets. These are completion
          percentages, not raw game stats.
        </p>
        {labels.map((name, i) => (
          <label className="milestone-control" key={name}>
            <span>
              <b>{name}</b>
              <strong>{plan.milestones[i]}%</strong>
            </span>
            <input
              aria-label={`${name} progress`}
              type="range"
              min={0}
              max={100}
              value={plan.milestones[i]}
              onChange={(ev) => {
                const a = [...plan.milestones];
                a[i] = Number(ev.target.value);
                patch({ milestones: a });
              }}
            />
            <small>
              {name === "Bodyfat"
                ? "Higher completion means closer to your chosen target."
                : "Your personal goal, your own pace."}
            </small>
          </label>
        ))}
        <button
          className="button primary"
          onClick={() => {
            patch({
              sessions: [
                ...plan.sessions,
                { date: new Date().toISOString(), value: average },
              ].slice(-20),
            });
            notify("Session checkpoint added to your history.");
          }}
        >
          <Plus size={16} />
          Log session checkpoint
        </button>
      </section>
      <aside className="progress-summary">
        <small className="overline">YOUR NEXT MILESTONE</small>
        <div
          className="progress-ring"
          style={{ "--progress": `${average}%` } as React.CSSProperties}
        >
          <div>
            <strong>
              {Math.round(average)}
              <small>%</small>
            </strong>
            <span>OVERALL COMPLETION</span>
          </div>
        </div>
        <h3>
          {average === 100
            ? "All goals reached!"
            : `Next focus: ${labels[plan.milestones.indexOf(Math.min(...plan.milestones))]}`}
        </h3>
        <p>Your least-complete personal target. No hidden game formula.</p>
        <div className="session-history">
          <h3>
            Session history <span>{plan.sessions.length} / 20</span>
          </h3>
          {plan.sessions.length > 0 ? (
            <>
              <div
                className="session-chart"
                role="img"
                aria-label="Logged session completion percentages"
              >
                {plan.sessions.map((x, i) => (
                  <div key={i} title={`${Math.round(x.value)}%`}>
                    <i style={{ height: `${Math.max(2, x.value)}%` }} />
                    <small>{i + 1}</small>
                  </div>
                ))}
              </div>
              {plan.sessions
                .slice(-5)
                .reverse()
                .map((x, i) => (
                  <div className="session-entry" key={i}>
                    <span>
                      {new Date(x.date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <strong>{Math.round(x.value)}%</strong>
                  </div>
                ))}
              <button
                className="text-link"
                onClick={() => patch({ sessions: plan.sessions.slice(0, -1) })}
              >
                Undo last checkpoint
              </button>
            </>
          ) : (
            <p>Log your first checkpoint to start tracking your sessions.</p>
          )}
        </div>
      </aside>
    </div>
  ) : (
    <div className="progress-layout">
      <section className="progress-controls">
        <small className="overline">PROGRESS / PASS CALCULATOR</small>
        <h2>Is the boost worth your time?</h2>
        <p>
          Use a rate you have measured in a session. The result is a personal
          estimate, not an official pass recommendation.
        </p>
        <div className="estimate-inputs">
          {(
            [
              ["current", "Current resource amount"],
              ["target", "Target resource amount"],
              ["rate", "Observed resources per hour"],
              ["multiplier", "Boost multiplier"],
            ] as const
          ).map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                aria-label={label}
                type="number"
                min={k === "multiplier" ? 1 : 0}
                max={k === "multiplier" ? 1000 : 1e8}
                step="any"
                value={e[k]}
                onChange={(ev) =>
                  patch({
                    estimate: {
                      ...e,
                      [k]: Math.min(
                        k === "multiplier" ? 1000 : 1e8,
                        Math.max(
                          k === "multiplier" ? 1 : 0,
                          Number(ev.target.value),
                        ),
                      ),
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
        <button
          className="button secondary"
          onClick={() => {
            patch({
              estimate: {
                current: 100,
                target: 1000,
                rate: 100,
                multiplier: 2,
              },
            });
            notify(
              "Example inputs loaded. Replace them with your own observations.",
            );
          }}
        >
          Try an example
        </button>
        <p className="source-note">
          Assumes a constant rate and the same multiplier on all gains. No
          purchase is made here.
        </p>
      </section>
      <aside className="progress-summary">
        <small className="overline">YOUR TIME, COMPARED</small>
        <div className="estimate-result">
          <span>Without boost</span>
          <strong>
            {e.rate > 0 ? base.toFixed(2) : "—"} <small>hours</small>
          </strong>
          <div style={{ width: "100%" }} />
        </div>
        <div className="estimate-result">
          <span>With {e.multiplier}× boost</span>
          <strong>
            {e.rate > 0 ? boosted.toFixed(2) : "—"} <small>hours</small>
          </strong>
          <div
            style={{ width: `${100 / e.multiplier}%`, background: "#a9ce88" }}
          />
        </div>
        <div className="estimate-saving">
          <span>Potential time saved</span>
          <strong>
            {e.rate > 0 ? (base - boosted).toFixed(2) : "—"} hours
          </strong>
        </div>
        <p>
          {e.rate <= 0
            ? "Enter a positive observed rate to calculate."
            : remaining === 0
              ? "Target already reached."
              : `${remaining.toLocaleString("en-US")} resources remaining at your observed rate.`}
        </p>
      </aside>
    </div>
  );
}
function Compare({
  plan,
  patch,
}: {
  plan: Plan;
  patch: (p: Partial<Plan>) => void;
}) {
  const chosen = plan.compare
    .map((id) => weapons.find((e) => e.id === id)!)
    .filter(Boolean);
  const colors = ["#ff914d", "#72d7db", "#c1da75"];
  return (
    <div className="compare-workspace">
      <div className="compare-selectors">
        {[0, 1, 2].map((n) => (
          <label key={n}>
            <span>WEAPON 0{n + 1}</span>
            <select
              aria-label={`Weapon ${n + 1}`}
              value={plan.compare[n] || ""}
              onChange={(ev) => {
                const a = [...plan.compare];
                a[n] = ev.target.value;
                patch({ compare: a.filter(Boolean) });
              }}
            >
              <option value="">Choose a weapon</option>
              {weapons.map((e) => (
                <option
                  key={e.id}
                  value={e.id}
                  disabled={
                    plan.compare.includes(e.id) && plan.compare[n] !== e.id
                  }
                >
                  {e.name} · {money(stat(e, "price"))}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="compare-cards">
        {chosen.map((e, i) => (
          <div
            key={e.id}
            className="compare-card"
            style={{ borderTopColor: colors[i] }}
          >
            <EntityArt entity={e} />
            <small>{String(e.data_json.category)}</small>
            <h2>{e.name}</h2>
            <strong style={{ color: colors[i] }}>
              {Math.round(
                timeToKill(stat(e, "damage"), stat(e, "rpm"), plan.health),
              )}{" "}
              ms
            </strong>
            <p>Calculated time to kill · {plan.health} HP</p>
          </div>
        ))}
      </div>
      <div className="comparison-table">
        <div className="stat-comparison header">
          <strong>BASE PLATFORM</strong>
          {chosen.map((e) => (
            <b key={e.id}>{e.name}</b>
          ))}
        </div>
        {[
          ["price", "Purchase cost", "$"],
          ["damage", "Damage / hit", ""],
          ["rpm", "Rate of fire", "rpm"],
          ["range", "Effective range", "m"],
          ["velocity", "Muzzle velocity", "m/s"],
          ["accuracy", "Accuracy", "mrad"],
        ].map(([key, label, unit]) => (
          <div className="stat-comparison" key={key}>
            <span>{label}</span>
            {chosen.map((e, i) => (
              <div key={e.id}>
                <b>
                  {key === "price"
                    ? money(stat(e, key))
                    : stat(e, key) + " " + unit}
                </b>
                <div className="stat-track">
                  <i
                    style={{
                      width: `${(stat(e, key) / Math.max(...chosen.map((c) => stat(c, key)))) * 100}%`,
                      background: colors[i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <section className="ttk-panel">
        <div>
          <small className="overline">CALCULATED / UNARMORED</small>
          <h2>Time to kill</h2>
          <p>
            First hit at time zero. All shots hit for base damage. No armor,
            damage falloff, reloads or latency.
          </p>
          <label className="health-control">
            Target health <strong>{plan.health} HP</strong>
            <input
              aria-label="Target health"
              type="range"
              min={1}
              max={500}
              step={1}
              value={plan.health}
              onChange={(e) => patch({ health: Number(e.target.value) })}
            />
          </label>
          <div className="chart-legend">
            {chosen.map((e, i) => (
              <span key={e.id} style={{ color: colors[i] }}>
                ● {e.name}
              </span>
            ))}
          </div>
        </div>
        <svg
          className="ttk-chart"
          viewBox="0 0 600 240"
          role="img"
          aria-label="Calculated time to kill across target health values"
        >
          <title>Time to kill by target health, in milliseconds</title>
          {[0, 1, 2, 3, 4].map((n) => (
            <g key={n}>
              <path
                d={`M45 ${20 + n * 45}H580`}
                stroke="#303840"
                strokeDasharray="3 5"
              />
              <text x="4" y={24 + n * 45} fill="#aab4be" fontSize="11">
                {1200 - n * 300}
              </text>
            </g>
          ))}
          {chosen.map((e, i) => (
            <polyline
              key={e.id}
              points={Array.from(
                { length: 100 },
                (_, n) =>
                  `${45 + (n / 99) * 530},${200 - (Math.min(1200, timeToKill(stat(e, "damage"), stat(e, "rpm"), n * 3 + 1)) / 1200) * 180}`,
              ).join(" ")}
              fill="none"
              stroke={colors[i]}
              strokeWidth="2.5"
            />
          ))}
          {[0, 100, 200, 300].map((n, i) => (
            <text key={n} x={45 + i * 176} y="227" fill="#aab4be" fontSize="11">
              {n} HP
            </text>
          ))}
        </svg>
      </section>
      <p className="source-note">
        Lower accuracy values indicate tighter spread. Chart clips at 1,200 ms.
        Source:{" "}
        {chosen.map((e) => (
          <a key={e.id} href={e.source_url}>
            {e.name} ↗{" "}
          </a>
        ))}{" "}
        · Closed Alpha/Beta, checked Sep 7, 2026.
      </p>
    </div>
  );
}
type Saved = {
  id: string;
  tool: string;
  name: string;
  plan: Plan;
  date: string;
};
export function PlayerLibrary() {
  const [saved, setSaved] = useState<Saved[]>([]),
    [recent, setRecent] = useState<string[]>([]);
  const { favorites } = useFavorites();
  useEffect(() => {
    queueMicrotask(() => {
      const a = readLocal<Saved[]>("gp:saved", []),
        b = readLocal<string[]>("gp:recent", []);
      setSaved(Array.isArray(a) ? a : []);
      setRecent(Array.isArray(b) ? b : []);
    });
  }, []);
  return (
    <>
      <section className="section">
        <h2>
          Saved plans <span className="muted">{saved.length}</span>
        </h2>
        <div className="saved-grid">
          {saved
            .filter((s) => tools.some((t) => t.id === s.tool))
            .map((s) => {
              const t = tools.find((t) => t.id === s.tool)!;
              return (
                <div className="saved-card" key={s.id}>
                  <small>
                    {t.game_id} / {t.name}
                  </small>
                  <h3>{s.name}</h3>
                  <p>{new Date(s.date).toLocaleDateString("en-US")}</p>
                  <div className="row between">
                    <Link
                      className="button primary"
                      href={`${toolHref(t)}#plan=${encodeURIComponent(JSON.stringify(s.plan))}`}
                    >
                      Open plan <ArrowUpRight size={14} />
                    </Link>
                    <button
                      className="icon-button"
                      aria-label={`Delete ${s.name}`}
                      onClick={() => {
                        const next = saved.filter((x) => x.id !== s.id);
                        setSaved(next);
                        try {
                          localStorage.setItem(
                            "gp:saved",
                            JSON.stringify(next),
                          );
                        } catch {}
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
        {!saved.length && (
          <div className="empty">
            <Bookmark />
            <h3>Your next good idea belongs here.</h3>
            <p>Use Save plan inside a builder to keep a named copy.</p>
            <Link className="button primary" href={toolHref(tools[0])}>
              Build a loadout
            </Link>
          </div>
        )}
      </section>
      <section className="section">
        <h2>Recently used</h2>
        <div className="recent-tools">
          {recent.map((id) => {
            const t = tools.find((t) => t.id === id);
            return t ? (
              <Link className="button secondary" href={toolHref(t)} key={id}>
                {t.name} ↗
              </Link>
            ) : null;
          })}
          {!recent.length && (
            <p className="muted">
              Your recently opened builders will appear here.
            </p>
          )}
        </div>
      </section>
      <section className="section">
        <h2>Favorite records</h2>
        {favorites.length ? (
          <Catalog records={entities.filter((e) => favorites.includes(e.id))} />
        ) : (
          <p className="muted">
            Bookmark any equipment or companion card to find it here.
          </p>
        )}
      </section>
      <p className="source-note">
        Saved on this device. Share a plan link to transfer it to another
        browser.
      </p>
    </>
  );
}
