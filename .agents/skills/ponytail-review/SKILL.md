---
name: ponytail-review
description: >
  Code review focused exclusively on over-engineering. Finds what to delete:
  reinvented standard library, unneeded dependencies, speculative abstractions,
  dead flexibility. Use when the user says "review for over-engineering", "what
  can we delete", "is this over-engineered", "simplify review", or invokes
  /ponytail-review. Complements correctness-focused review, this one only
  hunts complexity.
---

Review code or diffs for unnecessary complexity. The diff's best outcome is getting shorter.

## Tags

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Output Format — MANDATORY

For each finding, use this **multi-line block** format. DO NOT collapse to one-liners.

```
### <N>. [tag] <file>:L<line> — <short title>

**What it is:** 1–2 sentences explaining what the code currently does.
**Why it's bloat:** 1–2 sentences explaining why it's over-engineered.
**Fix:** Concrete replacement — show the short version inline when ≤5 lines, or describe it precisely.
**Impact:** -<N> lines / -<M> dep / [perf note]
```

Group findings by severity:
- 🔴 **HIGH** — dead deps, dead files, security-gap from over-engineering
- 🟡 **MEDIUM** — redundant abstractions, duplicate logic, wrappers that only delegate
- 🟢 **LOW** — minor shrinks, cosmetic dead code

Always include a **Summary Table** at the end:

| # | Tag | File | Finding | Impact |
|---|-----|------|---------|--------|
| 1 | shrink | file.ts:L12 | description | -N lines |

End with: `net: -<N> lines possible.`

If nothing to cut: `Lean already. Ship.`

## Bad vs Good Example

❌ BAD (too terse, Gemini falls into this):
```
src/lib/apiBase.ts:L1-43: shrink: 43 lines of env-sniffing. NEXT_PUBLIC_API_URL || fallback, ~8 lines.
```

✅ GOOD (required format):
```
### 1. [shrink] src/lib/apiBase.ts:L1–43 — Over-engineered URL resolver

**What it is:** 43-line function that checks `window.location.hostname` at
runtime to detect localhost, LAN IPs, Vercel domains, and falls back to a
hardcoded URL.

**Why it's bloat:** This is what `NEXT_PUBLIC_API_URL` is for. All the
runtime hostname-sniffing is dead flexibility — the env var already covers
every environment. The LAN IP detection is speculative: it only fires if
someone tests from a mobile on the same Wi-Fi AND forgot to set the env var.

**Fix:**
```ts
export function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.NODE_ENV === "development") return "http://localhost:5000";
  return "https://online-shopping-backend-liart.vercel.app";
}
```

**Impact:** -35 lines
```

## Boundaries

Scope: over-engineering and complexity only. Correctness bugs, security holes,
and performance are explicitly out of scope — route them to a normal review.
A single smoke test or assert-based self-check is the ponytail minimum, never
flag it for deletion. Does not apply the fixes, only lists them.

"stop ponytail-review" or "normal mode": revert to regular review style.
