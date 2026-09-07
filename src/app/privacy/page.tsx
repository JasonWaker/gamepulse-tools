import { siteConfig } from "@/lib/config";
export const metadata = {
  title: "Privacy",
  alternates: { canonical: `${siteConfig.url}/privacy/` },
};
export default function Page() {
  return (
    <article className="page-container prose inner-page">
      <small className="overline">YOUR PLAN STAYS YOURS</small>
      <h1>Privacy, simply.</h1>
      <p>Last updated September 7, 2026.</p>
      <h2>Local plans</h2>
      <p>
        Saved tool inputs are stored in your browser’s local storage. We do not
        upload your plans. Reset clears the current draft; named saved copies
        can be deleted in My toolkit. Clearing browser storage removes drafts,
        checkpoints, favorites and saved plans.
      </p>
      <h2>Shared links</h2>
      <p>
        A shared link contains your inputs in its URL fragment. Anyone with the
        full link can read them. Do not put private or sensitive information
        into equipment names or shared plans.
      </p>
      <h2>Analytics</h2>
      <p>
        Analytics is disabled unless an operator configures Google Analytics and
        you opt in. If enabled, events measure tool views, starts, explicit plan
        saves and shares. Declining prevents analytics loading. No advertising
        is present in this release.
      </p>
      <h2>External services</h2>
      <p>
        Hosting providers may process connection information such as IP
        addresses in their access logs. Official website links open external
        services with their own policies. Video players, when available, load
        only after you choose to load them. Roblox cover thumbnails load
        directly from Roblox’s image CDN and may transmit standard connection
        information to Roblox.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy questions, use the{" "}
        <a href={`${siteConfig.github}/issues`}>project issue tracker</a>. Do
        not include private personal information in a public issue.
      </p>
    </article>
  );
}
