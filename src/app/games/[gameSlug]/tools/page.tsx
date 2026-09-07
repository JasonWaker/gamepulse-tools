import { games, getGame, gameTools } from "@/lib/registry";
import { ToolCard, Breadcrumbs } from "@/components/shared";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/config";
export function generateStaticParams() {
  return games.map((g) => ({ gameSlug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;
  return {
    title: `${getGame(gameSlug)?.name} tools`,
    alternates: { canonical: `${siteConfig.url}/games/${gameSlug}/tools/` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;
  const g = getGame(gameSlug);
  if (!g) notFound();
  return (
    <div className="page-container inner-page">
      <Breadcrumbs
        items={[
          { label: g.name, href: `/games/${g.slug}` },
          { label: "Tools" },
        ]}
      />
      <h1>{g.name} tools</h1>
      <p className="lead">Build a plan that works for the way you play.</p>
      <div className="tool-grid hub-tools">
        {gameTools(g.id).map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>
    </div>
  );
}
