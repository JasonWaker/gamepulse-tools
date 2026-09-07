"use client";
import { useEffect, useRef, useState } from "react";
import {
  Save,
  Share2,
  RotateCcw,
  Plus,
  X,
  Search,
  Check,
  Shield,
  Crosshair,
} from "lucide-react";
import { gameEntities, type ToolDefinition, type Entity } from "@/lib/registry";
import { loadoutTotal, ttk, grind, progress } from "@/lib/calculations";
import { track } from "@/lib/analytics";
type State = Record<string, unknown>;
function validatePlan(raw: State): State {
  const clean: State = {};
  for (const [k, v] of Object.entries(raw)) {
    if (["__proto__", "constructor", "prototype"].includes(k)) continue;
    if (
      /^(budget|cost[0-4]|[ab](damage|rpm|magazine|reload|range|recoil)|health|Height|Face|Frame|Bodyfat|current|target|rate|multiplier)$/.test(
        k,
      ) &&
      typeof v === "number" &&
      Number.isFinite(v)
    )
      clean[k] = Math.min(100000000, Math.max(0, v));
    else if (/^(name[0-4]|[ab]name)$/.test(k) && typeof v === "string")
      clean[k] = v.slice(0, 80);
    else if (k === "team" && Array.isArray(v))
      clean[k] = [...new Set(v.filter((x) => typeof x === "string"))].slice(
        0,
        4,
      );
    else if (k === "custom" && Array.isArray(v))
      clean[k] = v
        .filter(
          (x) =>
            x &&
            typeof x.name === "string" &&
            typeof x.price === "number" &&
            Number.isFinite(x.price) &&
            x.price >= 0 &&
            typeof x.category === "string",
        )
        .slice(0, 100)
        .map((x) => ({
          name: x.name.slice(0, 80),
          price: Math.min(100000000, x.price),
          category: x.category.slice(0, 80),
        }));
  }
  return clean;
}

const number = (s: State, k: string, f = 0) =>
  typeof s[k] === "number" ? (s[k] as number) : f;
function Numeric({
  label,
  value,
  onChange,
  min = 0,
  max = 100000000,
  step = 1,
  placeholder,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        value={value ?? ""}
        placeholder={placeholder || "Enter value"}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = e.target.valueAsNumber;
          onChange(
            Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : undefined,
          );
        }}
      />
    </label>
  );
}
function Result({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="result-number">
      <small>{label}</small>
      <strong key={value}>
        {value}
        <em>{unit}</em>
      </strong>
    </div>
  );
}
function Loadout({
  state,
  set,
  tool,
}: {
  state: State;
  set: (s: State) => void;
  tool: ToolDefinition;
}) {
  const slots = tool.config_json.slots as string[];
  const [slot, setSlot] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("name");
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState<number | undefined>();
  const dialog = useRef<HTMLDialogElement>(null);
  const custom = Array.isArray(state.custom)
    ? (state.custom as { name: string; price: number; category: string }[])
    : [];
  const costs = slots.map((_, i) => number(state, `cost${i}`));
  const budget = number(state, "budget");
  const result = loadoutTotal(costs, budget);
  useEffect(() => {
    if (slot !== null) {
      dialog.current?.showModal();
      queueMicrotask(() => {
        setDraftName("");
        setDraftPrice(undefined);
      });
    } else dialog.current?.close();
  }, [slot]);
  const choices = custom
    .filter(
      (x) =>
        x.name.toLowerCase().includes(q.toLowerCase()) &&
        (filter === "All" || x.category === filter),
    )
    .sort((a, b) =>
      sort === "price" ? a.price - b.price : a.name.localeCompare(b.name),
    );
  return (
    <>
      <div className="workbench loadout-workbench">
        <div className="panel equipment">
          <div className="panel-heading">
            <Crosshair size={17} />
            <h2>Loadout slots</h2>
            <small>01—05</small>
          </div>
          {slots.map((name, i) => (
            <button
              className="equipment-slot"
              key={name}
              onClick={() => setSlot(i)}
            >
              <span className="slot-icon">
                {i === 3 ? <Shield /> : <Crosshair />}
              </span>
              <span>
                <small>{name}</small>
                <strong>
                  {String(state[`name${i}`] || "Select equipment")}
                </strong>
              </span>
              <span>
                {state[`name${i}`] ? (
                  `$${costs[i].toLocaleString()}`
                ) : (
                  <Plus size={18} />
                )}
              </span>
            </button>
          ))}
        </div>
        <div className="panel kit-preview">
          <small className="overline">DEPLOYMENT OVERVIEW</small>
          <div className="kit-reticle">
            <Crosshair size={112} strokeWidth={0.55} />
            <i />
            <span>
              {slots.filter((_, i) => state[`name${i}`]).length} / 5 EQUIPPED
            </span>
          </div>
          <h3>Your kit. Your call.</h3>
          <p>
            Add equipment and prices from your game session. All costs are your
            own inputs.
          </p>
          <div className="notice">
            Official equipment prices are not available yet.
          </div>
        </div>
        <div
          className={`panel summary ${result.over ? "warning" : ""}`}
          aria-live="polite"
        >
          <div className="panel-heading">
            <h2>Cash overview</h2>
            <span className="tiny-dot" />
          </div>
          <Numeric
            label="Available budget ($)"
            value={state.budget as number | undefined}
            onChange={(v) => set({ ...state, budget: v })}
          />
          <Result
            label="TOTAL CASH"
            value={`$${result.total.toLocaleString()}`}
          />
          <div className="progress-track">
            <i style={{ width: `${result.percent}%` }} />
          </div>
          <div className="row between balance">
            <span>{result.over ? "⚠ Over budget" : "Remaining cash"}</span>
            <b>${Math.abs(result.remaining).toLocaleString()}</b>
          </div>
          <p>
            {result.over
              ? "Adjust your kit or budget before deployment."
              : "Plan a kit that leaves room for your next move."}
          </p>
          <small>Personal inputs · Not verified game prices</small>
        </div>
      </div>
      <dialog
        className="equipment-dialog"
        ref={dialog}
        onCancel={() => setSlot(null)}
      >
        <div className="row between">
          <h2>{slot !== null ? slots[slot] : ""}</h2>
          <button
            className="icon-button"
            aria-label="Close equipment picker"
            onClick={() => setSlot(null)}
          >
            <X />
          </button>
        </div>
        <p>Add an item from your session, or select a saved item.</p>
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Search equipment"
            placeholder="Search your equipment"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="row">
          <label className="field">
            <span>Category</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {["All", ...slots].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Name</option>
              <option value="price">Price: low first</option>
            </select>
          </label>
        </div>
        <div className="saved-equipment">
          {choices.map((x, i) => (
            <button
              key={i}
              onClick={() => {
                set({
                  ...state,
                  [`name${slot}`]: x.name,
                  [`cost${slot}`]: x.price,
                });
                setSlot(null);
              }}
            >
              {x.name}
              <b>${x.price.toLocaleString()}</b>
            </button>
          ))}
          {!choices.length && (
            <p>No saved equipment matches. Add your first item below.</p>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draftName.trim() || draftPrice === undefined || slot === null)
              return;
            const item = {
              name: draftName.trim().slice(0, 80),
              price: draftPrice,
              category: slots[slot],
            };
            set({
              ...state,
              [`name${slot}`]: item.name,
              [`cost${slot}`]: item.price,
              custom: [
                ...custom.filter((x) => x.name !== item.name),
                item,
              ].slice(-100),
            });
            setSlot(null);
          }}
        >
          <label className="field">
            <span>Equipment name</span>
            <input
              required
              maxLength={80}
              value={draftName}
              placeholder="Name from your game"
              onChange={(e) => setDraftName(e.target.value)}
            />
          </label>
          <Numeric
            label="Price in game ($)"
            value={draftPrice}
            onChange={setDraftPrice}
          />
          <button
            className="button primary"
            disabled={!draftName.trim() || draftPrice === undefined}
          >
            Add to loadout <Plus size={18} />
          </button>
        </form>
        {slot !== null && state[`name${slot}`] !== undefined && (
          <button
            className="text-button"
            onClick={() => {
              const s = { ...state };
              delete s[`name${slot}`];
              delete s[`cost${slot}`];
              set(s);
              setSlot(null);
            }}
          >
            Remove from slot
          </button>
        )}
      </dialog>
    </>
  );
}
const comparisonStats = [
  ["damage", "Damage / hit"],
  ["rpm", "Rounds / minute"],
  ["magazine", "Magazine size"],
  ["reload", "Reload (seconds)"],
  ["range", "Range (meters)"],
  ["recoil", "Recoil (same scale)"],
] as const;
function Comparator({ state, set }: { state: State; set: (s: State) => void }) {
  const [health, setHealth] = [
    state.health as number | undefined,
    (v: number | undefined) => set({ ...state, health: v }),
  ];
  return (
    <div className="comparison-layout">
      <div className="notice">
        Personal comparison · Enter observed stats for both weapons. No official
        weapon stats are published here.
      </div>
      <div className="comparison-inputs">
        {["a", "b"].map((side, i) => (
          <div className="panel" key={side}>
            <small className="overline">WEAPON {i ? "B" : "A"}</small>
            <label className="field">
              <span>Weapon name</span>
              <input
                maxLength={80}
                value={String(state[`${side}name`] || "")}
                placeholder="Enter weapon name"
                onChange={(e) =>
                  set({ ...state, [`${side}name`]: e.target.value })
                }
              />
            </label>
            <div className="input-grid">
              {comparisonStats.map(([key, label]) => (
                <Numeric
                  label={label}
                  key={key}
                  value={state[side + key] as number | undefined}
                  step={key === "reload" ? 0.1 : 1}
                  onChange={(v) => set({ ...state, [side + key]: v })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="row between">
          <h2>Side-by-side stats</h2>
          <span className="badge">YOUR DATA</span>
        </div>
        {comparisonStats.map(([key, label]) => {
          const a = state["a" + key] as number | undefined,
            b = state["b" + key] as number | undefined;
          const max = Math.max(a || 0, b || 0, 1);
          const available = a !== undefined && b !== undefined;
          const low = key === "reload" || key === "recoil";
          const winner =
            !available || a === b
              ? "Equal"
              : (low ? a! < b! : a! > b!)
                ? "A"
                : "B";
          return (
            <div className="stat-comparison" key={key}>
              <span>{label}</span>
              <div>
                <strong>{a ?? "—"}</strong>
                <div className="stat-track">
                  <i style={{ width: `${((a || 0) / max) * 100}%` }} />
                </div>
                <small>
                  {available
                    ? winner === "Equal"
                      ? "Equal"
                      : `${winner} ${low ? "lower" : "higher"}`
                    : "Data unavailable"}
                </small>
                <div className="stat-track right">
                  <i style={{ width: `${((b || 0) / max) * 100}%` }} />
                </div>
                <strong>{b ?? "—"}</strong>
              </div>
            </div>
          );
        })}
        <div className="ttk">
          <Numeric
            label="Target health for estimated TTK"
            value={health}
            min={1}
            onChange={setHealth}
          />
          {["a", "b"].map((s) => {
            const n = ttk(
              number(state, s + "damage"),
              number(state, s + "rpm"),
              health || 0,
            );
            return (
              <Result
                key={s}
                label={`WEAPON ${s.toUpperCase()} · ESTIMATED TTK`}
                value={n === null ? "—" : n.toFixed(3)}
                unit={n === null ? "Data unavailable" : "sec"}
              />
            );
          })}
        </div>
        <p className="source-note">
          TTK = (ceil(health ÷ damage) − 1) × 60 ÷ RPM. Assumes every shot hits,
          constant damage and no armor, falloff or reload. Recoil comparison is
          only meaningful on the same measurement scale.
        </p>
      </div>
    </div>
  );
}
function Team({
  state,
  set,
  tool,
}: {
  state: State;
  set: (s: State) => void;
  tool: ToolDefinition;
}) {
  const roster = gameEntities(tool.game_id);
  const ids = Array.isArray(state.team)
    ? (state.team as string[])
        .filter((id) => roster.some((e) => e.id === id))
        .slice(0, Number(tool.config_json.slots))
    : [];
  const [q, setQ] = useState("");
  const selected = ids.map((id) => roster.find((e) => e.id === id)!);
  const types = [
    ...new Set(selected.map((e) => e.data_json.type).filter(Boolean)),
  ];
  return (
    <div className="team-layout">
      <div>
        <div className="panel">
          <div className="row between">
            <h2>Your adventure crew</h2>
            <small>
              {ids.length} / {Number(tool.config_json.slots)} SELECTED
            </small>
          </div>
          <p>
            Four planning slots. This is a personal roster, not a claim about
            the in-game team limit.
          </p>
          <div className="team-slots">
            {Array.from({ length: Number(tool.config_json.slots) }, (_, i) => {
              const e = selected[i];
              return (
                <div className={e ? "team-slot filled" : "team-slot"} key={i}>
                  {e ? (
                    <>
                      <button
                        aria-label={`Remove ${e.name}`}
                        onClick={() =>
                          set({
                            ...state,
                            team: ids.filter((id) => id !== e.id),
                          })
                        }
                      >
                        <X size={16} />
                      </button>
                      <span className="creature-symbol">✧</span>
                      <strong>{e.name}</strong>
                      <small>
                        NO. {String(e.data_json.index).padStart(3, "0")}
                      </small>
                    </>
                  ) : (
                    <>
                      <Plus />
                      <small>SLOT 0{i + 1}</small>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="row between collection-heading">
          <h2>Aniimo collection</h2>
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="Search Aniimo"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find a companion…"
            />
          </label>
        </div>
        <div className="entity-grid collection">
          {roster
            .filter((e) => e.name.toLowerCase().includes(q.toLowerCase()))
            .map((e: Entity) => (
              <div className="entity-card" key={e.id}>
                <small>NO. {String(e.data_json.index).padStart(3, "0")}</small>
                <span className="creature-symbol">✧</span>
                <h3>{e.name}</h3>
                <small>Official name · Type pending</small>
                <button
                  className="button secondary"
                  disabled={
                    ids.includes(e.id) ||
                    ids.length >= Number(tool.config_json.slots)
                  }
                  onClick={() => set({ ...state, team: [...ids, e.id] })}
                >
                  {ids.includes(e.id) ? (
                    <>
                      <Check size={14} />
                      Selected
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Add to team
                    </>
                  )}
                </button>
              </div>
            ))}
        </div>
        {!roster.some((e) =>
          e.name.toLowerCase().includes(q.toLowerCase()),
        ) && <p>No companions match that search.</p>}
      </div>
      <aside className="panel team-analysis">
        <small className="overline">TEAM ANALYSIS</small>
        <Result
          label="COMPANIONS SELECTED"
          value={String(ids.length).padStart(2, "0")}
        />
        <h3>Types</h3>
        <p>{types.length ? types.join(", ") : "Data not available yet."}</p>
        <h3>Strengths & weaknesses</h3>
        <p>Awaiting verified type interactions.</p>
        <h3>Skill coverage</h3>
        <p>Awaiting verified skill data.</p>
        <div className="notice">
          Names are from the official Aniimo index. No battle recommendations
          are inferred.
        </div>
        <a
          className="text-link"
          href="https://wiki.aniimo.com/"
          target="_blank"
          rel="noreferrer"
        >
          Official Aniimo index ↗
        </a>
      </aside>
    </div>
  );
}
function Progress({
  state,
  set,
  tool,
}: {
  state: State;
  set: (s: State) => void;
  tool: ToolDefinition;
}) {
  const stats = tool.config_json.stats as string[];
  const values = stats.map((k) => number(state, k));
  const result = progress(values);
  return (
    <div className="workbench two-cols">
      <div className="panel">
        <h2>Set your personal progress</h2>
        <p>
          How close are you to your own goal? These are personal completion
          percentages, not raw game stats. For Bodyfat, a higher percentage
          means closer to your chosen target.
        </p>
        {stats.map((k, i) => (
          <label className="slider-field" key={k}>
            <span>
              {k}
              <strong>{values[i]}%</strong>
            </span>
            <input
              aria-label={`${k} progress`}
              type="range"
              min="0"
              max="100"
              value={values[i]}
              onChange={(e) => set({ ...state, [k]: Number(e.target.value) })}
            />
            <div>
              <small>JUST STARTING</small>
              <small>GOAL REACHED</small>
            </div>
          </label>
        ))}
      </div>
      <div className="panel summary">
        <small className="overline">YOUR NEXT MILESTONE</small>
        <div
          className="progress-ring"
          style={{ "--progress": `${result.average}%` } as React.CSSProperties}
        >
          <div>
            <strong>
              {Math.round(result.average)}
              <small>%</small>
            </strong>
            <span>OVERALL PROGRESS</span>
          </div>
        </div>
        <h3>
          {result.average === 100
            ? "All goals reached!"
            : `Next focus: ${stats[result.focus]}`}
        </h3>
        <p>
          {result.average === 100
            ? "Set new goals when you are ready."
            : "Your least-complete personal goal. This suggestion uses only the percentages you entered, not a hidden game formula."}
        </p>
        <div className="notice">
          Upgrade costs and grind estimates need verified game data. Use the
          Pass Calculator with your observed rate for a personal estimate.
        </div>
      </div>
    </div>
  );
}
function Pass({ state, set }: { state: State; set: (s: State) => void }) {
  const keys = ["current", "target", "rate", "multiplier"];
  const ready = keys.every((k) => typeof state[k] === "number");
  const result = ready
    ? grind(
        number(state, "current"),
        number(state, "target"),
        number(state, "rate"),
        number(state, "multiplier"),
      )
    : null;
  return (
    <div className="workbench two-cols">
      <div className="panel">
        <h2>Model your next grind</h2>
        <p>
          Enter values measured in your own session. We do not assume any
          official pass price or boost.
        </p>
        <div className="input-grid">
          <Numeric
            label="Current resource amount"
            value={state.current as number | undefined}
            onChange={(v) => set({ ...state, current: v })}
          />
          <Numeric
            label="Target resource amount"
            value={state.target as number | undefined}
            onChange={(v) => set({ ...state, target: v })}
          />
          <Numeric
            label="Observed resources per hour"
            value={state.rate as number | undefined}
            min={0.01}
            step={0.01}
            onChange={(v) => set({ ...state, rate: v })}
          />
          <Numeric
            label="Boost multiplier (1 = no boost)"
            value={state.multiplier as number | undefined}
            min={1}
            step={0.1}
            max={1000}
            onChange={(v) => set({ ...state, multiplier: v })}
          />
        </div>
        <div className="notice">
          Assumes a constant rate and a multiplier applied to all resource
          gains. Actual sessions may vary.
        </div>
      </div>
      <div className="panel summary" aria-live="polite">
        <small className="overline">ESTIMATED TIME</small>
        <Result
          label="WITHOUT BOOST"
          value={result ? result.base.toFixed(2) : "—"}
          unit="hours"
        />
        <Result
          label="WITH BOOST"
          value={result ? result.boosted.toFixed(2) : "—"}
          unit="hours"
        />
        <div className="savings">
          <span>Potential time saved</span>
          <strong>{result ? result.saved.toFixed(2) : "—"} hours</strong>
        </div>
        {!result && <p>Enter all four values to calculate your estimate.</p>}
        {result && result.remaining === 0 && <p>✓ Target already reached.</p>}
      </div>
    </div>
  );
}
const renderers = {
  loadout: Loadout,
  comparator: Comparator,
  team: Team,
  progress: Progress,
  pass: Pass,
};
export function ToolWorkbench({ tool }: { tool: ToolDefinition }) {
  const [state, setState] = useState<State>({});
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  const started = useRef(false);
  const storageKey = `gp:${tool.id}:v1`;
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const shared = new URLSearchParams(window.location.hash.slice(1)).get(
          "plan",
        );
        const raw = shared
          ? decodeURIComponent(escape(atob(shared)))
          : localStorage.getItem(storageKey);
        if (raw && raw.length < 30000) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
            setState(validatePlan(parsed));
        }
      } catch {
        setToast("Saved plan could not be loaded. Start a fresh plan.");
      }
      setReady(true);
      track("tool_view", tool.id);
    });
  }, [storageKey, tool.id]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(id);
  }, [toast]);
  const set = (s: State) => {
    setState(s);
    if (!started.current) {
      track("tool_start", tool.id);
      started.current = true;
    }
  };
  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      track("tool_complete", tool.id, { completion: "explicit_save" });
      setToast("Plan saved on this device.");
    } catch {
      setToast("Storage is unavailable. Try sharing your plan instead.");
    }
  };
  const share = async () => {
    try {
      const serialized = btoa(
        unescape(encodeURIComponent(JSON.stringify(state))),
      );
      const url = `${window.location.href.split("#")[0]}#plan=${encodeURIComponent(serialized)}`;
      if (url.length > 16000) {
        setToast(
          "Plan is too large to share. Remove saved equipment and retry.",
        );
        return;
      }
      await navigator.clipboard.writeText(url);
      track("tool_share", tool.id);
      setToast("Plan link copied. Anyone with the link can view your inputs.");
    } catch {
      setToast(
        "Clipboard is unavailable. Save your plan on this device instead.",
      );
    }
  };
  const Component = renderers[tool.tool_type];
  return (
    <div
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          save();
        }
      }}
    >
      <div className="workbench-toolbar">
        <span>
          <i /> PERSONAL PLANNING WORKSPACE
        </span>
        <div>
          <button
            onClick={() => {
              setState({});
              try {
                localStorage.removeItem(storageKey);
              } catch {}
              history.replaceState(null, "", location.pathname);
              setToast("Plan reset.");
            }}
            title="Clear the current and saved plan"
          >
            <RotateCcw size={15} />
            Reset
          </button>
          <button onClick={save}>
            <Save size={15} />
            Save plan
          </button>
          <button onClick={share}>
            <Share2 size={15} />
            Share
          </button>
        </div>
      </div>
      {ready ? (
        <Component state={state} set={set} tool={tool} />
      ) : (
        <div className="skeleton" aria-label="Loading planning workspace" />
      )}
      <div className="workspace-note">
        <Check size={15} /> No account needed. Saved plans stay in this browser.
        <span>v{tool.version}</span>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
