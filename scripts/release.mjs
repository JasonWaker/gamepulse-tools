import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const { version } = JSON.parse(readFileSync("package.json", "utf8"));
const notes = readFileSync("CHANGELOG.md", "utf8");
if (!notes.includes(`## ${version}`))
  throw Error("Add a change log entry for the current version first.");
if (execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim())
  throw Error("Commit changes before creating a release tag.");
execFileSync(
  "git",
  ["tag", "-a", `v${version}`, "-m", `GamePulse Tools v${version}`],
  { stdio: "inherit" },
);
console.log(
  `Created v${version}. Push main and tags, then create the GitHub release with the matching notes.`,
);
