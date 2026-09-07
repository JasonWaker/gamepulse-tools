import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  ShieldCheck,
  Zap,
  Globe2,
} from "lucide-react";
import { games, tools, gameTools, toolHref } from "@/lib/registry";
import { siteConfig } from "@/lib/config";
import { Atmosphere } from "@/components/atmosphere";
import { Badge, SectionTitle, ToolCard, GameCard } from "@/components/shared";
export const metadata = { alternates: { canonical: siteConfig.url } };
export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-ambient" />
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="pulse-dot" /> YOUR NEXT GAME. YOUR NEXT ADVANTAGE.
          </div>
          <h1>
            New worlds.
            <br />
            Better plans.
            <br />
            <span>Get ahead.</span>
          </h1>
          <p>
            Tools for the games everyone is about to play.
            <br />
            Calculators, planners and databases. Built for players
            <br className="desktop-break" /> who like to be one step ahead.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/games">
              Explore games <ArrowUpRight size={19} />
            </Link>
            <Link className="button secondary" href="/tools">
              Browse tools <ArrowRight size={18} />
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <Crosshair size={15} />3 game companions
            </span>
            <span>
              <Zap size={15} />5 interactive tools
            </span>
            <span>No sign-up. Just play.</span>
          </div>
        </div>
        <div className="hero-stack">
          <div className="stack-label">
            <span>
              <i /> THE NEXT WAVE
            </span>
            <small>CURATED WATCHLIST / 001</small>
          </div>
          {games.map((g, i) => (
            <Link
              key={g.id}
              className={`stack-card stack-${i}`}
              style={
                { "--accent": g.theme.primary_color } as React.CSSProperties
              }
              href={`/games/${g.slug}`}
            >
              <Atmosphere game={g} />
              <div className="stack-content">
                <small>
                  0{i + 1} — {g.eyebrow}
                </small>
                <h2>{g.name}</h2>
                <div className="row">
                  <Badge>{g.status}</Badge>
                  <span>
                    {g.platforms[0]} · {gameTools(g.id).length} tools
                  </span>
                </div>
              </div>
              <ArrowUpRight className="stack-arrow" />
            </Link>
          ))}
        </div>
      </section>
      <div className="trend-strip">
        <span>
          <i /> ON OUR RADAR
        </span>
        {games.map((g) => (
          <Link key={g.id} href={`/games/${g.slug}`}>
            <strong>{g.name}</strong>
            <small>{g.status}</small>
            <ArrowUpRight size={14} />
          </Link>
        ))}
        <span className="strip-end">EARLY FINDS. USEFUL TOOLS.</span>
      </div>
      <div className="page-container">
        <section className="section">
          <SectionTitle
            eyebrow="THE FEATURED COMPANION"
            title="Every dollar. Every decision."
            href="/games/wardogs"
            label="Explore WARDOGS"
          />
          <div
            className="featured"
            style={
              {
                "--accent": games[0].theme.primary_color,
              } as React.CSSProperties
            }
          >
            <div className="featured-art">
              <Atmosphere game={games[0]} large />
              <div className="featured-mark">
                <small>TACTICAL ALL-OUT WARFARE</small>
                <h2>WARDOGS</h2>
                <span>PLAN. EQUIP. DEPLOY.</span>
              </div>
              <div className="art-caption">
                ORIGINAL TACTICAL ATMOSPHERE · NOT GAME FOOTAGE
              </div>
            </div>
            <div className="featured-copy">
              <Badge>FEATURED GAME</Badge>
              <h2>
                A better loadout.
                <br />A smarter deployment.
              </h2>
              <p>
                Know what your kit costs before you hit the battlefield. Build a
                loadout with your own prices and keep your budget in check.
              </p>
              <div className="feature-meta">
                <span>
                  PLATFORM<b>PC</b>
                </span>
                <span>
                  DEVELOPER<b>BULKHEAD</b>
                </span>
                <span>
                  TOOLS<b>02 AVAILABLE</b>
                </span>
              </div>
              <Link className="button primary" href={toolHref(tools[0])}>
                Open Loadout Planner <ArrowUpRight size={18} />
              </Link>
              <div className="featured-links">
                <Link href={toolHref(tools[1])}>Weapon Comparator ↗</Link>
                <Link href="/games/wardogs/database">Database ↗</Link>
              </div>
            </div>
          </div>
        </section>
        <section className="section" id="popular-tools">
          <SectionTitle
            eyebrow="LESS GUESSWORK. MORE GAMEPLAY."
            title="Your next advantage."
            href="/tools"
            label="All tools"
          />
          <div className="tool-grid">
            {tools.slice(0, 4).map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
        <section className="section">
          <SectionTitle
            eyebrow="FIND YOUR NEXT WORLD"
            title="Different games. Same head start."
            href="/games"
            label="Discover games"
          />
          <div className="game-grid">
            {games.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
        <section className="manifesto">
          <div>
            <small className="overline">BUILT FOR THE WAY YOU PLAY</small>
            <h2>
              The game changes.
              <br />
              Your tools should keep up.
            </h2>
          </div>
          <div>
            <ShieldCheck />
            <h3>Sources before stats.</h3>
            <p>
              Verified data when we have it. Clear labels when we don’t. No
              made-up advantages.
            </p>
          </div>
          <div>
            <Globe2 />
            <h3>Your plan. Anywhere.</h3>
            <p>
              Fast, free tools that work on your phone. No account standing
              between you and your next game.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
