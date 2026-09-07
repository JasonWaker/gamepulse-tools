import { siteConfig } from "@/lib/config";
import { media } from "@/lib/media";
export const metadata = {
  title: "About & data policy",
  alternates: { canonical: `${siteConfig.url}/about/` },
};
export default function Page() {
  return (
    <article className="page-container prose inner-page">
      <small className="overline">SOURCES BEFORE STATS</small>
      <h1>
        Built for players.
        <br />
        Clear about the details.
      </h1>
      <p>
        {siteConfig.name} is an independent game companion network. We build
        useful tools for games on our editorial watchlist. We are not affiliated
        with game developers or publishers.
      </p>
      <h2>What you can trust</h2>
      <p>
        Official records carry a source URL, verification date and game version
        when provided. User-entered calculator inputs are personal estimates.
        Missing data is labelled unavailable. Watchlist positions are editorial
        choices, not measured trending scores.
      </p>
      <h2>Media rights register</h2>
      <p>
        WARDOGS cover images come from Team17’s official Press & Creator Hub.
        Equipment illustrations, element emblems and the adventure landscape are
        original generated artwork, not game models or character portraits.
        Roblox thumbnails remain externally hosted. Every displayed asset has a
        recorded source and usage basis.
      </p>
      {media.map((m) => (
        <div className="policy-record" key={m.id}>
          <strong>{m.id}</strong>
          <span className="badge">{m.rights_status}</span>
          <p>{m.license_note}</p>
          <a href={m.source_url}>Source: {m.source_owner} ↗</a>
        </div>
      ))}
      <h2>Versions and corrections</h2>
      <p>
        Current release: v{siteConfig.version}. Report an incorrect record or
        tool issue on <a href={`${siteConfig.github}/issues`}>GitHub</a>. Every
        release includes a version and change log.
      </p>
    </article>
  );
}
