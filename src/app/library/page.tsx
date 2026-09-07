import { PlayerLibrary } from "@/components/player-tools";
import { siteConfig } from "@/lib/config";
export const metadata = {
  title: "My toolkit",
  robots: { index: false, follow: true },
  alternates: { canonical: siteConfig.url + "/library/" },
};
export default function Page() {
  return (
    <div className="page-container inner-page">
      <small className="overline">YOUR PERSONAL WORKSPACE</small>
      <h1>My toolkit</h1>
      <p className="lead">
        Your saved builds, favorite records, and recently used tools.
      </p>
      <PlayerLibrary />
    </div>
  );
}
