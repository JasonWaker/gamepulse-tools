# Source review workflow

Run `npm run data:check` locally, or run **Check source data for review** in GitHub Actions. This is on demand, not scheduled.

The checker reads the published source URLs, extracts weapon price/base-stat/ammo facts and vehicle price/seat facts, and compares them with the catalog. It also extracts code/reward pairs from the official experience description. Output is `candidate/source-report.json` and `candidate/codes.json`. Full third-party articles are not stored.

A nonzero exit means at least one source failed or its layout changed. Published data stays intact. A source with no code matches is a review signal, not evidence that every old code expired. Absence from the description must not automatically become an expired status.

Review changes against the linked source, then edit catalog rows and their review dates deliberately. Unknown values remain null and must not enter calculations that require them. The checker does not validate combat formulas, redemption outcomes, media rights, gear prices or Aniimo records. Those require separate review. It does not update prices silently or republish the site. Each approved update goes through tests, a version bump, changelog and release.

For this release the new six weapon and three vehicle rows were reviewed against their individual WardogsHQ pages. Four code/reward pairs were reviewed against the official Roblox experience API. All WARDOGS numerical data remains community-recorded beta data. No launch verification is claimed.
