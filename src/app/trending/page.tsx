import { games } from "@/lib/registry";
import { GameCard } from "@/components/shared";
import { siteConfig } from "@/lib/config";
export const metadata = {
  title: "Games on our radar",
  alternates: { canonical: `${siteConfig.url}/trending/` },
};
export default function Page() {
  return (
    <div className="page-container inner-page">
      <small className="overline">THE NEXT WAVE</small>
      <h1>On our radar.</h1>
      <p className="lead">
        An editorial watchlist, not a live popularity ranking. We choose games
        where a useful tool can make a difference.
      </p>
      <div className="game-grid">
        {games.map((g) => (
          <GameCard game={g} key={g.id} />
        ))}
      </div>
      <p className="source-note">
        Trend and opportunity scores are not published until measured data is
        available.
      </p>
    </div>
  );
}
