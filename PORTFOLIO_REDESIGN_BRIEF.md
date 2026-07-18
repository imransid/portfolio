# Portfolio Redesign Brief

> **Provenance.** Reconstructed from the owner's written instructions and Phase-0 sign-off (the original
> could not be written to this repo in-session; Claude cannot write to the owner's disk). The owner has
> confirmed this file, including the design gate pasted verbatim into §7 below, as **canonical**. It is
> the authoritative working spec.

Last updated: 2026-07-18.

---

## 0. Audience and strategy (unchanged)

One audience: an **Upwork client ~90 seconds into evaluating a proposal, on a phone, with 8 other
proposals open.** Not recruiters, not peers. No testimonials, reviews, or recommendations exist;
every claim is self-asserted. The only trust available is **links a client can open and verify**.
Therefore **factual accuracy is the product strategy, not a detail.** Every inflated word attacks the
only edge the site has.

---

## 1. Canonical project set (DECIDED — Q1)

**Canonical = the repo's 11 projects**, as they exist in `lib/portfolio/defaults.ts`:

`Balanzify · BAZZILE · Bangladesh RAB · MyRef/Myrep · Playzone · GodConnect Online · IQApp Test ·
NIdle Finishing · Team Pharma · JTI Sheikh App · Converter & Wallet`

- **Dropped from the brief entirely:** GoStyle, Yalla Shisha, Pick&Go, Smart Pass, **and Zoniqx.**
  They are real but have no URLs or details; **not invented.** `§5.5`'s PENDING rows are **deleted.**
  They get added later with real details, or not at all.
- Per-project link/label verification is in [PHASE_0_FINDINGS.md](PHASE_0_FINDINGS.md) §1–§2. Four
  "more" projects (IQApp Test, JTI Sheikh App, Converter & Wallet, Team Pharma) currently have **no
  working link and no number** — they conflict with the hard rule "no claim without a link or a
  number." Flagged for the owner's cut/keep decision in the copy review; not silently deleted.

---

## 2. Source of truth and reconcile (DECIDED — Q2)

- **Truth = `lib/portfolio/defaults.ts`.** All fixes land there.
- Runtime precedence (merged): **Firestore `portfolio/main` → `data/portfolio.json` →
  `data/site-content.json` → `defaults.ts`** (`lib/portfolio/store.ts:521`). Firestore wins, so it may
  have **drifted** from code.
- **Reconcile step (before re-seed):** owner exports the live Firestore `portfolio/main` doc and hands
  it over. Diff against `defaults.ts`, **report drift**, port any Firestore-only content into
  `defaults.ts`. Then **re-seed via `/api/admin/seed-firestore`** so `defaults.ts` is truth and
  Firestore becomes a cache.
- **Do not edit `data/portfolio.json`.** (It holds only `portfolioUrl`; editing it would create a new
  drift source above `defaults.ts` in precedence.)
- Observable drift so far (from the live site, pending the raw export): live deployment serves the
  **same 11 projects**, Bazzile categorized as "Real Estate Marketplace" (i.e., the live site is NOT
  the stale "Dating App" data — that was the retired DOCX, see §4). Exact field-level diff pending the
  export.

---

## 3. Bazzile facts (DECIDED — Q3)

Independently verified in [PHASE_0_FINDINGS.md](PHASE_0_FINDINGS.md) §3.

**Ships (verified):**
- Swiss company (BAZZILE TECHNOLOGY SA), based in **Geneva**.
- **Real estate marketplace**; listings **from professionals only**.
- **AI-ranked listings**; **integrated with most agency CRMs.**
- **70,000 downloads in France in twelve months** (Sept 2023 → Sept 2024). Copy line reads exactly:
  **"70,000 downloads in France in twelve months"** — never 135k.
- **~15,000 active users in France.**
- **Live on both stores.**

**Cut (unsupported/contradicted):** 135k total downloads, 350k listings, founding year.

**Framing:** never **"built"** — always **"shipped features into"**. Bazzile is a third-party product;
Imran contributed features, he did not own it.

**Link fix:** App Store `/us/` → **`/fr/`** (`https://apps.apple.com/fr/app/bazzile/id1622224603`,
verified 200). Add Google Play `com.bazzile.app` (verified 200).

---

## 4. Consistency chain — FOUR surfaces, ONE dataset

New finding (owner): **two CVs exist.**
- The **generated CV** (`/api/cv-download` → `getPortfolioData` → `portfolioToCvBuffer`) is
  data-driven, clean, and **cannot drift.** **This is the only CV.**
- A stale hand-maintained `Imran_Khan_CV_.docx` lives **outside the repo** and is the one actually sent
  to clients today. It says Bazzile is a **"Dating App"** and points MyRef, "My Representative," and
  IQApp Test all at `com.godconnect.online`. **It is being retired.**

**Consistency chain (all must agree):**

    proposal  →  Upwork profile  →  site  →  generated CV

Four surfaces, **one dataset** (`defaults.ts` → Firestore cache). Any fact that appears on one must
match all four. The retired DOCX is removed from this chain.

---

## 5. Performance budget (AMENDED — the important one)

The Phase-0 finding stands: effective homepage JS is **~340 kB gz**, because `ssr:false` does **not**
defer anything when the Hero mounts the canvas on load — **three.js sits on the critical path for 100%
of visitors today.** That kills the spec as written. Restated budget:

- **250 kB gz applies to FIRST-LOAD JS. three.js is not permitted in first-load at all.**
- **Delete `@react-three/drei` now** — 0 kB, never imported, dead dependency. Do not reintroduce.
  For §7B, **hand-roll `RoundedBox` and `useVideoTexture`** (~15 lines) instead.
- **Hero topology (§7A) is NO LONGER three.js.** It is above the fold → **2D canvas or SVG, ~2–5 kB.**
  Nodes, edges, and moving packets do not need WebGL; a 2D pseudo-3D projection reads better (nobody
  has to rotate it to understand it). Better design, not a compromise.
- **three + fiber (~209 kB gz) survive ONLY for the device / video-texture (§7B)** — below the fold,
  loaded on **IntersectionObserver after LCP.** Acceptable there because LCP is done and the user has
  already scrolled.
- **framer-motion 39 kB → `LazyMotion` + `domAnimation` (~15 kB).** Do it.
- **Kill `force-dynamic` on `app/page.tsx`** (implemented in the build phase with on-demand
  revalidation — `revalidatePath` from the admin save — so admin edits still appear without a rebuild).
- **Hard gate:** if the §7B device scene cannot load post-LCP without moving homepage LCP, **it gets
  cut.** The 3D serves the site; the site does not serve the 3D.
- Targets unchanged: **LCP < 2.0s on throttled 4G; first-load JS < 250 kB gz.** Blow the budget and the
  3D is cut, not the budget.

---

## 6. Copy rules (reconstructed from stated principles)

> The original §6 text was not available. These rules are reconstructed from the owner's explicit
> instructions across the brief and Phase-0 messages. All Phase-1 copy is written to them.

1. **Every claim carries a link or a number.** No claim survives with neither.
2. **No inflation.** No "top selling," "high-performance," "world-class," "significantly," "cutting
   edge." If a result is claimed, it is quantified (a number) or linked (proof).
3. **Verified verbs.** "shipped features into" / "contributed to" for third-party products (Bazzile,
   GodConnect). "Built" / "led" only where Imran owned the work.
4. **"Live" is earned.** Never label a project Live unless the URL has been personally opened and a
   stranger can use it. Deployment ≠ launch. Login walls and preview URLs are not "Live."
5. **No em dash characters anywhere**, including the generated DOCX. (En dashes normalized to hyphens
   too.)
6. **No green, any state.** No testimonial section, no invented placeholders.
7. **Written for the 90-second phone reader:** front-loaded, scannable, concrete. Numbers and proof
   over adjectives.
8. **Consistency chain (§4):** any fact must read the same across proposal, Upwork, site, generated CV.

---

## 7. Design (approval gate)

Follow the frontend-design skill's two-pass method: plan, self-critique, revise, present, build. Do not
write component code until I approve the plan.

**BAN LIST**
- The current look, in full: near-black + single warm amber #f5a524 + Fraunces serif display + 01/02/03
  numbered eyebrows + a ✶ glyph + a "Manifesto" heading. It is executed well and it is the default dark
  portfolio the client has seen on thirty other sites. Competent is not memorable. Do not hand it back.
- Cream #F4F1EA + high-contrast serif + terracotta #D97757. That accent is Claude's own interaction
  color and reads as a tell on a user's brief.
- Acid green or vermilion on near-black.
- Broadsheet: hairline rules, zero radius, dense newspaper columns.
- Fraunces.
- Numbered eyebrows EXCEPT in "How I work", where the content genuinely is a sequence and the numbering
  carries information the reader needs.
- No green anywhere, any state. Live pills find another signal.
- No em dashes.

**THE PLAN YOU PRESENT MUST CONTAIN**
- Color: 4-6 named hex values, each with its reason.
- Type: display, body, utility/mono. Justify the pairing against the subject, which is live systems and
  instrumentation, not a design agency.
- Layout: one-sentence concept + ASCII wireframes for hero, card, archive, contact.
- Signature: one sentence on what this page is remembered by.

**THEN CRITIQUE IT BEFORE SHOWING ME**
Ask honestly: would I have produced this for any other backend engineer's portfolio? Work a similar
prompt and see if you land somewhere similar. If yes for any part, revise it and say what changed and
why. Only present after that.

Spend the boldness in one place: the topology. Everything around it stays quiet and disciplined. Remove
one accessory before leaving the house. Quality floor, unannounced: responsive to mobile, visible
keyboard focus, reduced motion respected.

**ONE DIRECTION, NOT A MANDATE**
The vernacular of instrumentation: monospace data, status pills, real timestamps, service topology,
uptime. Native to what I actually do, not the generic dark portfolio, and it makes the invisible half
of the work visible. The status taxonomy already needs pills, so the system has a real job rather than
a decorative one. Reject it if you have something better and can defend it.

---

## 8. Hard rules (no exceptions)

- `/hire` contains **zero contact information** (Upwork ToS). Grep `mailto:`, `tel:`, `linkedin`,
  `cv-download` before calling it done. (Route does not exist yet.)
- Never label **Live** without personally opening the URL and confirming a stranger can use it.
- **No em dash characters anywhere**, including the generated DOCX.
- **No green, any state.**
- **No testimonial section.** No invented placeholders.
- **No claim without a link or a number behind it.**
- Design must not be the default answer (near-black + amber `#f5a524` + Fraunces + 01/02/03 eyebrows).
  See the ban list; Phase 2 must not hand back the current look.

---

## 9. Design tokens to purge (from the current default look)

`signal.green` token (`tailwind.config.ts`), the green availability dot (`Hero.tsx`), amber `#f5a524`
as the sole accent, Fraunces as the only display face, `01/02/03` numeric eyebrows. Phase 2 produces a
new token plan and self-critiques it ("would I have produced this for any other backend engineer?").

---

## 10. Build order

1. **Phase 0 — Research & audit.** DONE ([PHASE_0_FINDINGS.md](PHASE_0_FINDINGS.md)).
2. **Phase 1 — Facts & copy.** Fixes in `defaults.ts` (+ `build-cv-docx.ts`, site-content), then full
   copy rewrite to §6. Show copy, stop for approval. **← current.**
3. **Phase 2 — Design plan.** Two-pass token/type/layout plan + self-critique. Approval gate. No
   component code until approved.
4. **Phase 3 — Build the entire site with ZERO WebGL. Ship it.** Kill `force-dynamic`, LazyMotion,
   perf budget enforced.
5. **Phase 4–5 — three.js, only §7B device/video (post-LCP, IntersectionObserver).** §7A hero is 2D.
6. Perf gate at every step: LCP < 2.0s throttled 4G, first-load JS < 250 kB gz.

---

## 11. Phase 2 sign-off and Phase 3 preconditions (2026-07-18)

**Design plan APPROVED** (§7 two-pass method; colour, type, and the critique process stand). Confirmed:

- **Map semantics.** The hero is a bipartite graph: product leaves, tech hubs. An edge renders ONLY if
  the tech is in that card's own `tech` array (assert-against-stack; no edge, no render). No
  product-to-product edges. Absorbs the Skills section into the hero.
- **Spine = highest-degree hubs (degree >= 3):** NestJS x7, PostgreSQL x4, React Native x4, GraphQL x3.
  12 always-visible nodes (4 hubs + 8 products); secondary/leaf techs on focus and as card chips. Noted
  honestly: this is "the highest-degree hubs", a pragmatic cut, NOT a natural boundary in the data.
- **Skills:** absorbed into the hero. KILL the Primary/Strong/Working levels (self-assessed,
  unverifiable, violate no-claim-without-evidence). Hub degree replaces them with an auditable COUNT
  (NestJS x7 is a fact, not an opinion). Keep a compact FLAT keyword strip for the long tail (Docker,
  GitHub Actions, Stripe, Sentry, Expo EAS, Supabase, Django, Socket.IO, ...): no levels, no categories.
- **Status: two pills only** — `live`, `in production`. No Demo pill, no 4th. Demo / Case study are
  carried by the link label, not a pill.
- **The health check is the arbiter.** A build-time check hits every external link; the glyph renders
  the real result; a claimed-Live link that dies flags the build. Do not override the instrument with a
  judgement about a URL. **Playzone = Live** (a stranger can open and play it now; the ugly domain is a
  pending purchase, not a status). NIdle = no pill (pending owner factory check).
- **Honest motion:** static facts never animate (70,000 downloads is a fixed Sept 2023 to Sept 2024
  press figure); the only ticking value is Go Smart uptime, computed from a fixed date. No free pulse.
- **Type/perf:** Martian Mono (display), JetBrains Mono (data), Geist Sans (body); next/font, subset,
  display:swap; Fraunces dropped. Route CTA: `/` "explore work", `/hire` "Hire me on Upwork" (zero
  contact info on /hire).

**OPEN HOLDS — the map is NOT built until the owner resolves these:**
1. **Golang.** The retired CV claims Golang on Playzone, RAB, NIdle (and "Proficient in Golang" in the
   summary, first under Core Skills), but NONE of the site stacks include it. If real, Golang joins the
   stacks and the spine (degree 3) and is the differentiator (React Native + Golang + a live bank
   backend). If the CV inflated it, it comes out of the CV. One or the other, not both.
2. **Go Smart stack.** From the retired buggy CV, UNCONFIRMED (flagged in `defaults.ts`). Its two spine
   edges (NestJS, PostgreSQL) are held out of the hero until confirmed. Spine survives without it.

**First Phase-3 artifact:** the real rendered 360px mobile hero, for owner review before it hardens.
