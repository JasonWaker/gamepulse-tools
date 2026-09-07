import { Discovery } from "@/components/discovery";
import { siteConfig } from "@/lib/config";
export const metadata = {
  title: "Discover rising games",
  description:
    "Explore three independent game companions and their interactive tools.",
  alternates: { canonical: `${siteConfig.url}/games/` },
};
export default function Page() {
  return (
    <div className="page-container inner-page">
      <small className="overline">FIND YOUR NEXT WORLD</small>
      <h1>
        Pick your game.
        <br />
        <em>Get your advantage.</em>
      </h1>
      <p className="lead">Independent companions for the games on our radar.</p>
      <Discovery />
    </div>
  );
}
