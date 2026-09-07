import { notFound } from "next/navigation";
import { tools, getGame, gameTools, toolHref } from "@/lib/registry";
import { Breadcrumbs, ToolCard } from "@/components/shared";
import { ToolLoader } from "@/components/tool-loader";
import { siteConfig } from "@/lib/config";
export function generateStaticParams() {
  return tools.map((t) => ({ gameSlug: t.game_id, toolSlug: t.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameSlug: string; toolSlug: string }>;
}) {
  const { gameSlug, toolSlug } = await params;
  const t = tools.find((t) => t.game_id === gameSlug && t.slug === toolSlug);
  return {
    title: `${getGame(gameSlug)?.name} ${t?.name}`,
    description: t?.short_description,
    alternates: {
      canonical: `${siteConfig.url}/games/${gameSlug}/tools/${toolSlug}/`,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${getGame(gameSlug)?.name} ${t?.name}`,
      description: t?.short_description,
      images: [`${siteConfig.url}/og.png`],
    },
    openGraph: {
      images: [`${siteConfig.url}/og.png`],
      type: "website" as const,
      siteName: siteConfig.name,
      title: `${getGame(gameSlug)?.name} ${t?.name}`,
      description: t?.short_description,
      url: `${siteConfig.url}/games/${gameSlug}/tools/${toolSlug}/`,
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ gameSlug: string; toolSlug: string }>;
}) {
  const { gameSlug, toolSlug } = await params;
  const t = tools.find((t) => t.game_id === gameSlug && t.slug === toolSlug);
  const g = getGame(gameSlug);
  if (!t || !g) notFound();
  const faq = [
    {
      q: "Are these official game stats?",
      a: "No. Calculations use your own inputs. Aniimo names come from the official index; unverified combat stats and interactions are not displayed.",
    },
    {
      q: "Can I save or share my plan?",
      a: "Save plan stores it in this browser. Share copies a URL containing your inputs. Anyone with that link can read the plan.",
    },
    {
      q: "Does this tool work on mobile?",
      a: "Yes. All planning controls support touch and keyboard input. No account or download is required.",
    },
  ];
  const url = `${siteConfig.url}${toolHref(t)}/`;
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `${g.name} ${t.name}`,
        url,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        softwareVersion: t.version,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: siteConfig.url },
          { name: g.name, item: `${siteConfig.url}/games/${g.slug}/` },
          { name: t.name, item: url },
        ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((x) => ({
          "@type": "Question",
          name: x.q,
          acceptedAnswer: { "@type": "Answer", text: x.a },
        })),
      },
    ],
  };
  return (
    <div className="page-container tool-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(json).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumbs
        items={[
          { label: g.name, href: `/games/${g.slug}` },
          { label: "Tools", href: `/games/${g.slug}/tools` },
          { label: t.name },
        ]}
      />
      <div className="tool-header">
        <div>
          <small className="overline">{g.name} / PLAYER TOOLS</small>
          <h1>{t.name}</h1>
          <p>{t.short_description}</p>
        </div>
        <span className="badge">v{t.version} · NEW</span>
      </div>
      <ToolLoader tool={t} />
      <div className="tool-details">
        <section>
          <small className="overline">HOW IT WORKS</small>
          <h2>A plan built around your inputs.</h2>
          <p>
            Start with the values from your own game session, adjust your
            choices, and see the results update immediately. Save a plan locally
            or share a link when you are ready.
          </p>
          <p>
            Personal estimates are not official game recommendations. Missing
            source data stays unavailable until it can be verified.
          </p>
          <a className="text-link" href={g.source_url}>
            Game source: {g.developer} ↗
          </a>
          <p className="source-note">
            Game information checked {g.verified_at}. Tool version {t.version}.
            User-entered values have no verified game version.
          </p>
        </section>
        <section>
          <small className="overline">GOOD TO KNOW</small>
          {faq.map((x) => (
            <details key={x.q}>
              <summary>{x.q}</summary>
              <p>{x.a}</p>
            </details>
          ))}
        </section>
      </div>
      <section className="section">
        <h2>Keep planning.</h2>
        <div className="tool-grid hub-tools">
          {gameTools(g.id)
            .filter((x) => x.id !== t.id)
            .concat(tools.filter((x) => x.game_id !== g.id))
            .slice(0, 3)
            .map((x) => (
              <ToolCard key={x.id} tool={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
