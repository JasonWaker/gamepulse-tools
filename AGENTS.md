# GamePulse Tools
- Keep this project independent from sibling projects.
- Every published update must increment package.json version, update tool versions when changed, add CHANGELOG.md notes, and create a matching vX.Y.Z Git tag and GitHub release. Never reuse a published version.
- Publish the GitHub Pages URL requested by the user. Keep Cloudflare static-export portability.
- No invented game stats, trending scores, active codes or media permissions. Inputs are personal estimates. Thin entity pages stay noindex.
- All game routes use the registry and tool type dispatch. Do not branch business logic on game slug.
- Never expose Supabase secret keys. RLS is required on all public tables.
- Run lint, typecheck, calculation/RLS tests, build, and relevant browser checks before publishing.
