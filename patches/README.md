# minimatch 10.2.6 security backport

`minimatch@10.2.6.patch` backports the runtime changes from upstream commit
[77a0f5c4b80bdc641c3c930a1d9edf5ad2db57f8](https://github.com/isaacs/minimatch/commit/77a0f5c4b80bdc641c3c930a1d9edf5ad2db57f8)
to both published CommonJS and ESM entry points. It caps `**/..` expansion at
`braceExpandMax` (default 100,000) and skips quadratic deduplication above 1,000
patterns. The regression tests adapt the upstream cases, using a bounded attack
fixture so an unpatched install fails assertions without exhausting resources.

This addresses [GHSA-g3hv-75wg-m249 / CVE-2026-118764](https://github.com/advisories/GHSA-g3hv-75wg-m249).
The advisory affects >=7.0.0 <11.0.1 and requires attacker-controlled patterns with
`optimizationLevel >= 2`. TypeScript ESLint's current call site uses `dot: true`
and the default optimization level; this is defensive dependency remediation,
not evidence of an exploitable application endpoint.

As of 2026-11-05, typescript-estree 8.72.1 still requires minimatch ^10.2.2 and no
patched 10.x release exists. Version 11 rewrites matching and removes APIs; this
version-specific patch preserves the 10.x API. pnpm applies it to both locked
estree versions (8.65.0 and 8.72.1), including frozen installations. Remove the
patch and its regression tests once upstream dependencies adopt a patched
release, after checking the replacement against this project's validation.

Separately, ESLint advances from 9.39.2 to 9.39.5 within its existing major
version. This upstream release requires minimatch ^3.1.5 and updates its config
packages, addressing GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj and
GHSA-23c5-xmqv-rm74 without changing the callable CommonJS API.

The patched package retains version 10.2.6. Version-based scanners (including
Dependabot and pnpm audit) can therefore still report GHSA-g3hv-75wg-m249 and the
automatic security updater may remain blocked. This change does not dismiss or
suppress that advisory, nor address unrelated existing audit findings. The
backport is an interim runtime mitigation, not a claim that the advisory or
security-update blocker has been closed.
