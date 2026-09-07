import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Crosshair,
  Layers,
  GitCompareArrows,
  ChartNoAxesCombined,
  Zap,
} from "lucide-react";
import {
  games,
  gameTools,
  toolHref,
  type Game,
  type ToolDefinition,
} from "@/lib/registry";
import { Atmosphere } from "./atmosphere";
export const icons = {
  loadout: Crosshair,
  comparator: GitCompareArrows,
  team: Layers,
  progress: ChartNoAxesCombined,
  pass: Zap,
};
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="badge">
      <i />
      {children}
    </span>
  );
}
export function GameCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="game-card"
      style={{ "--accent": game.theme.primary_color } as React.CSSProperties}
    >
      <div className="game-card-art">
        <Atmosphere game={game} />
        <span className="game-wordmark">{game.name}</span>
        <span className="corner-badge">{game.status}</span>
      </div>
      <div className="game-card-bottom">
        <div>
          <small>{game.platforms.join(" · ")}</small>
          <h3>
            {game.name}
            {game.art === "monolith" ? " · Mog or Die" : ""}
          </h3>
          <p>{gameTools(game.id).length} tools available</p>
        </div>
        <ArrowUpRight size={20} />
      </div>
    </Link>
  );
}
export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const game = games.find((g) => g.id === tool.game_id)!;
  const Icon = icons[tool.tool_type];
  return (
    <Link
      className="tool-card"
      href={toolHref(tool)}
      style={{ "--accent": game.theme.primary_color } as React.CSSProperties}
    >
      <div className="row between">
        <span className="icon-box">
          <Icon size={22} />
        </span>
        <small className="status">{tool.status}</small>
      </div>
      <small className="overline">{game.name}</small>
      <h3>{tool.name}</h3>
      <p>{tool.short_description}</p>
      <div className="tool-mini">
        {tool.tool_type === "loadout" ? (
          <>
            <span>
              YOUR KIT <b>05 SLOTS</b>
            </span>
            <div className="mini-slots">
              {[Crosshair, Crosshair, Zap, Layers, Crosshair].map((I, i) => (
                <i key={i}>
                  <I size={18} />
                </i>
              ))}
            </div>
          </>
        ) : tool.tool_type === "team" ? (
          <>
            <span>YOUR NEXT ADVENTURE</span>
            <div className="mini-slots creatures">
              {["01", "02", "03", "04"].map((n) => (
                <i key={n}>{n}</i>
              ))}
            </div>
          </>
        ) : (
          <>
            <span>
              {tool.tool_type === "comparator"
                ? "SIDE-BY-SIDE COMPARISON"
                : "YOUR NEXT MILESTONE"}
            </span>
            <div className="mini-bars">
              <i />
              <i />
              <i />
            </div>
          </>
        )}
      </div>
      <div className="row between card-bottom">
        <span>Open tool</span>
        <ArrowUpRight size={18} />
      </div>
    </Link>
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Link href="/">Home</Link>
      {items.map((x, i) => (
        <span key={i}>
          / {x.href ? <Link href={x.href}>{x.label}</Link> : x.label}
        </span>
      ))}
    </nav>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  href,
  label = "View all",
}: {
  eyebrow: string;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-title">
      <div>
        <small className="overline">{eyebrow}</small>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-link">
          {label}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function EmptyState({
  title = "Data not available yet.",
  description = "Verified game data will appear here when a reliable source is available.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty">
      <Crosshair size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function AdSlot() {
  return <div data-ad-slot="reserved" hidden />;
}
