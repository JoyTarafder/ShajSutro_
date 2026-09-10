---
name: ponytail-audit
description: >
  Whole-repo audit for over-engineering. Like ponytail-review, but scans the
  entire codebase instead of a diff: a ranked list of what to delete, simplify,
  or replace with stdlib/native equivalents. Use when the user says "audit this
  codebase", "audit for over-engineering", "what can I delete from this repo",
  "find bloat", "ponytail-audit", or "/ponytail-audit". One-shot report, does
  not apply fixes.
---

Whole-repo scan for over-engineering. Rank findings biggest cut first.

## Tags

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Hunt

Deps the stdlib or platform already ships, single-implementation interfaces,
factories with one product, wrappers that only delegate, files exporting one
thing, dead flags and config, hand-rolled stdlib, dead imports, unused deps in
package.json.

## Output Format — MANDATORY

**DO NOT** output one-liners. Every finding gets a detailed block.

Group findings by severity with headers:

```
## 🔴 HIGH — Cut immediately

### <N>. [tag] <file> — <short title>

**What it is:** 1–2 sentences describing the code.
**Why it's bloat:** 1–2 sentences explaining the over-engineering.
**Fix:** Concrete replacement or `npm uninstall <pkg>`. Show short code inline when ≤ 5 lines.
**Impact:** -<N> lines / -<M> dep

---

## 🟡 MEDIUM — Simplify

[same block format]

---

## 🟢 LOW — Minor shrinks

[same block format]
```

Always include a **Summary Table** at the end:

| # | Tag | Location | Finding | Impact |
|---|-----|----------|---------|--------|
| 1 | delete | backend/package.json | `slugify` never imported | -1 dep |

End with: `net: -<N> lines, -<M> deps possible.`

Nothing to cut: `Lean already. Ship.`

## Example Finding Block

```
### 2. [shrink] backend/src/config/mailer.ts — Transport recreated on every email send

**What it is:** `getTransporter()` is called inside a thin object's `sendMail`
and `verify` methods, creating a brand-new Nodemailer transport (and TCP
handshake) on every single email sent.

**Why it's bloat:** Nodemailer transports are designed to be reused — they
pool SMTP connections internally. Recreating one per call defeats that pooling,
adding latency to every email and making high-volume sends slower.

**Fix:** Cache the transporter at module level:
```ts
let _t: Transporter | null = null;
export function getTransporter() {
  return (_t ??= nodemailer.createTransport(...config));
}
```

**Impact:** -6 lines, perf fix (removes per-send TCP reconnect)
```

## Boundaries

Scope: over-engineering and complexity only. Correctness bugs, security holes,
and performance are explicitly out of scope — route them to a normal review.
Lists findings only, applies nothing. One-shot.

"stop ponytail-audit" or "normal mode" to revert.
