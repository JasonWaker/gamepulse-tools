"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { games, tools } from "@/lib/registry";
import { GameCard, ToolCard, EmptyState } from "./shared";
export function Discovery({ mode = "games" }: { mode?: "games" | "tools" }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const options =
    mode === "games"
      ? ["All", "PC", "Console", "Mobile", "Roblox"]
      : ["All", "WARDOGS", "Aniimo", "Agartha"];
  const selectedGames = games.filter(
    (g) =>
      filter === "All" || g.platforms.includes(filter) || g.name === filter,
  );
  const gs = selectedGames.filter((g) =>
    g.name.toLowerCase().includes(q.toLowerCase()),
  );
  const ts = tools.filter(
    (t) =>
      selectedGames.some((g) => g.id === t.game_id) &&
      (t.name + " " + t.game_id).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="filter-bar">
        <div className="filter-pills">
          {options.map((x) => (
            <button
              className={filter === x ? "selected" : ""}
              key={x}
              onClick={() => setFilter(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            placeholder={`Search ${mode}…`}
            aria-label={`Search ${mode}`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>
      <div className={mode === "games" ? "game-grid" : "tool-grid"}>
        {mode === "games"
          ? gs.map((g) => <GameCard game={g} key={g.id} />)
          : ts.map((t) => <ToolCard tool={t} key={t.id} />)}
      </div>
      {(mode === "games" ? gs : ts).length === 0 && (
        <EmptyState
          title="No matches found"
          description="Try another game, platform or search term."
        />
      )}
    </>
  );
}
