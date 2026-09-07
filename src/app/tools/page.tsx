import { Discovery } from "@/components/discovery";
import { siteConfig } from "@/lib/config";
export const metadata = {
  title: "All player tools",
  alternates: { canonical: `${siteConfig.url}/tools/` },
};
export default function Page() {
  return (
    <div className="page-container inner-page">
      <small className="overline">YOUR PLAYER TOOLKIT</small>
      <h1>
        Less guesswork.
        <br />
        <em>More gameplay.</em>
      </h1>
      <p className="lead">
        Five focused tools. No sign-up. Your next plan starts here.
      </p>
      <Discovery mode="tools" />
    </div>
  );
}
