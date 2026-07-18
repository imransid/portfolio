# Phase 0 — Research & Audit Findings

Date: 2026-07-17. Status: **research only, no code changed.** Awaiting approval to proceed to Phase 1.

---

## Finding 0 (blocker): the brief is missing, and it describes a different project set than exists

- `PORTFOLIO_REDESIGN_BRIEF.md` is **not in the repo**, not in git history (all three commits are "first commit"), not stashed, not anywhere under `/Users/rafa`. Phase 0 was run from the self-contained instructions in your message (you approved this).
- The real portfolio data is **not** in `data/portfolio.json` (96 bytes, only a `portfolioUrl`). It lives in **`lib/portfolio/defaults.ts`**, with Firestore `portfolio/main` as a runtime override. The CV (`lib/cv/build-cv-docx.ts`) is **fully data-driven** — it has no hardcoded project URLs of its own; it renders whatever is in `PortfolioData`.
- **The brief's project names do not exist here.** The brief references **GoStyle, Yalla Shisha, Pick&Go, Smart Pass, and "My Representative."** None appear in `defaults.ts`, and none appear on the **live site** (`imran-khan-chi.vercel.app`), which serves the *same* 11 projects as the repo:
  `Balanzify, BAZZILE, Bangladesh RAB, MyRef, Playzone, GodConnect Online, IQApp Test, NIdle Finishing, Team Pharma, JTI Sheikh App, Converter & Wallet.`

  **Implication:** Phase 1 says "fix every accuracy bug in §3 across all surfaces" and the hard rules name GoStyle / Yalla Shisha / Pick&Go / Smart Pass as "In development." I cannot label or fix projects that do not exist, and I will not invent them. **Before Phase 1 I need to know which project set is canonical:** the 11 in the repo, or the brief's set (which would mean new projects to add). This is the single most important thing to resolve.

---

## 1. Link audit

Every external URL, its source, live HTTP status (redirects followed), and verdict.

| URL | Source (defaults.ts) | Use | HTTP result | Verdict |
|---|---|---|---|---|
| `https://balanzify.com` | :175 | Balanzify "Live site" | 308 → **200** `www.balanzify.com` | Redirects apex→www. Loads, but it is a **login-walled SaaS** ("Log In" / dashboard) — a stranger cannot use the product. Not "Live" per your rule. Point at `www.` and reconsider the label. |
| `https://apps.apple.com/us/app/bazzile/id1622224603` | :196 | Bazzile App Store | **200** | Live. Real listing (see §2). Missing the **Play Store** link (`com.bazzile.app`), which also exists. |
| `https://rab.gov.bd` | :210 | Bangladesh RAB | **000 — no DNS** (fails on 8.8.8.8 and 1.1.1.1) | **DEAD as written.** Apex has no A record. Correct host is `https://www.rab.gov.bd` → **200**. Fix the URL. |
| `https://play.google.com/store/apps/details?id=com.myref.app` | :225 | MyRef Play Store | **200** | Live. Store title is **"Myrep," developer Jumatechs** (see §2/§5). Name mismatch to reconcile. |
| `https://playzone-update.vercel.app/` | :248 | Playzone "Live demo" | **200** | Loads (`<title>Playerzone</title>`). It is a **Vercel preview URL**, not a product domain. Usable, but reads as a demo, not a launch. |
| `https://apps.apple.com/us/app/godconnect-online/id1518393186` | :265 | GodConnect iOS | **200** | Live. Seller of record: **Olumide Oyebode** (third party, not Imran). |
| `https://play.google.com/store/apps/details?id=com.godconnect.online` | :269 | GodConnect Android | **200** | Live. Developer: **GodConnect LTD** (not Imran). |
| `https://intellier.com/nidle/` | :295 | NIdle case study | **200** | Live. Real page: "Nidle Smart Factory Solution — Intellier." |
| `https://teampharmabd.com/` | :307 | Team Pharma "Live site" | **000 — connection refused** (DNS resolves to 199.250.194.93, but 443 and 80 refuse) | **DOWN.** Cannot be labeled Live. |
| `https://play.google.com/store/apps/details?id=com.converter.wallet` | :334 | Converter & Wallet Play Store | **404 "Not Found"** | **DEAD.** Delete this link. |
| `https://imran-khan-chi.vercel.app/` | :424 + `portfolio.json` | portfolioUrl | **200** | OK — the site itself. |
| `https://github.com/imransid` | :447, :464 | GitHub | **200** | OK. |
| `https://www.linkedin.com/in/imran-khan-9bb7b5147/` | :441, :465 | LinkedIn | 301 → **999** | 999 is LinkedIn's anti-bot code; **not verifiable by automation.** Confirm manually in a browser. |
| `https://maps.google.com/?q=Dhaka,Bangladesh` | :453 | Map link | 302 → **200** | OK (generic maps query, always resolves). |

**Dead/broken to fix or delete:** `rab.gov.bd` (→ `www.`), `com.converter.wallet` (404, delete), `teampharmabd.com` (down, no Live label).

---

## 2. Store-link verification

Your premise: *"The CV points MyRef, My Representative and IQApp Test all at `com.godconnect.online`."* **That is not true in this repo.** The CV is generated from `PortfolioData`, and there:
- **MyRef** → `com.myref.app` (a *different* app, live).
- **IQApp Test** → **no links at all** (`links: []`).
- **"My Representative"** → **does not exist.**
- `com.godconnect.online` is used **only** by the **GodConnect Online** project.

So no link actually mis-points three apps at godconnect. The brief likely describes a CV generated from an older/broken dataset that is not in this repo. The real store facts:

| Link in code | Claimed as | Actual store title | Actual developer/seller | Note |
|---|---|---|---|---|
| `apps.apple.com/.../bazzile/id1622224603` | BAZZILE | **Bazzile** | **BAZZILE TECHNOLOGY SA** | "SA" = Swiss corporate form; desc cites "Switzerland and Europe." Matches. |
| `play.google.com/...?id=com.myref.app` | MyRef | **"Myrep"** | **Jumatechs** | Same app as the brief's "My Representative" (see §5). Jumatechs = Imran's current employer. |
| `play.google.com/...?id=com.godconnect.online` | GodConnect Online | **GodConnect Online** | **GodConnect LTD** | Third-party owner. |
| `apps.apple.com/.../godconnect-online/id1518393186` | GodConnect Online | **GodConnect Online** | **Olumide Oyebode** | Different seller name than Android; both third-party, not Imran. |
| `play.google.com/...?id=com.converter.wallet` | Converter & Wallet | **"Not Found"** | — | Dead listing (404). Delete. |
| IQApp Test | IQApp Test | — | — | No link in data; unverifiable → cannot be "Live." |

**GodConnect ownership caveat:** the store seller of record is a third party (GodConnect LTD / Olumide Oyebode), consistent with contract work but not with Imran "owning" the product. Copy should say he *built / shipped features for* it, not that it is his.

---

## 3. Bazzile facts — independent web verification

Sourced independently (Swiss software registry, Geneva yellowpages, French trade press, store listings). Verdicts against your `§3.1` numbers:

| Claim | Verdict | Evidence |
|---|---|---|
| Swiss company | ✅ **Confirmed** | "BAZZILE TECHNOLOGY SA," listed on swissmadesoftware.org; yellowpages.swiss lists it in Genève. |
| Geneva | ✅ **Confirmed** | Rue Charles-Galland 15, 1206 Genève (yellowpages.swiss); Facebook "Bazzile \| Geneva." |
| Founded **2022** | ⚠️ **Contested** | Journal de l'Agence says "launched in 2022"; another aggregator says "launched in 2020"; an older App Store ID (`id1447051520`) predates the current app. **Do not assert a founding year** without the Geneva commercial-register date. Not Imran's claim anyway. |
| **135k+** total downloads | ❌ **Unverified** | No source states a total. Primary press gives only France figures. Play install badge could not be read cleanly. **Per your rule, this does not ship.** |
| **350k** listings | ❌ **Contradicted** | Sources say **"more than 150,000 listings"** (swissmadesoftware.org), not 350k. If a listings number is used at all, it is **150,000+**. |
| **70k** France downloads, Sep 2023 → Sep 2024 | ✅ **Confirmed (verbatim)** | Journal de l'Agence: "downloaded 70,000 times between September 2023 and September 2024," present in France since 2023. Bonus verified: **~15,000 active users in France.** |
| Live on **both** stores | ✅ **Confirmed** | App Store `id1622224603` + Google Play `com.bazzile.app`, both BAZZILE TECHNOLOGY SA. |

**Net:** Bazzile is real, Swiss, Geneva-based, real estate ("le Tinder de l'immobilier"), live on both stores, 70k France downloads confirmed. **Drop 135k downloads and 350k listings** (unsupported / contradicted). Founding year: omit or verify via register.

Sources: [swissmadesoftware.org](https://www.swissmadesoftware.org/en/companies/bazzile-technology-sa/home.html) · [yellowpages.swiss](https://yellowpages.swiss/location.cfm?key=2308557&company=BAZZILE-TECHNOLOGY-SA&art=HRB) · [Journal de l'Agence](https://www.journaldelagence.com/1403035-lapplication-de-recherche-immobiliere-bazzile-veut-conquerir-la-france) · [App Store](https://apps.apple.com/us/app/bazzile/id1622224603) · [Google Play](https://play.google.com/store/apps/details?id=com.bazzile.app)

---

## 4. Bundle & performance baseline

Environment: `yarn install` (Yarn 4 PnP) ✓, `next build` ✓ (Next 14.2.15). Next's reported figures are **gzipped** (verified: a chunk Next labels "53.6 kB" is 53.8 kB gzipped / 172.8 kB raw).

**First Load JS per route (gzipped):**

| Route | Type | First Load JS |
|---|---|---|
| `/` | ƒ dynamic | **134 kB** |
| `/admin/dashboard` | ƒ dynamic | 97.6 kB |
| `/admin` | ƒ dynamic | 88.4 kB |
| `/_not-found` | static | 88.2 kB |
| Shared by all | — | 87.3 kB |
| All `/api/*` | ƒ dynamic | 0 B (server only) |

**The 134 kB number is misleading.** `ThreeScene` is a `ssr:false` dynamic import, so its chunks are **not counted** in First Load JS, yet it renders unconditionally at the top of the Hero and therefore downloads **immediately after hydration on every homepage visit.** What a phone actually pulls on `/`:

| Library | Chunk | Gzipped | Raw | Loaded |
|---|---|---|---|---|
| React + react-dom (framework) | `8c6cc93e` | 52.5 kB | 168.8 kB | sync (first load) |
| shared vendor | `38` | 30.9 kB | 120.6 kB | sync |
| **framer-motion** | `84` | **39.0 kB** | 119.3 kB | **sync (first load)** |
| page + runtime | `page`, `webpack`, `main-app` | ~8.6 kB | ~38 kB | sync |
| **three.js core** | `b9fe4f90` | **167 kB** | **679 kB** | **async, on hydration** |
| **@react-three/fiber** | `406` | **~42 kB** | 132 kB | **async, on hydration** |
| **@react-three/drei** | — | **0 kB** | — | **never imported (dead dependency)** |

- Synchronous first load ≈ **131 kB gz** / 447 kB raw.
- Effective homepage total incl. the 3D that loads right after ≈ **131 + 167 + 42 ≈ 340 kB gz** — **over the 250 kB budget by ~90 kB**, before any of the Phase 4/5 3D work.
- **framer-motion (~39 kB gz)** is ~30% of synchronous first load and is imported eagerly by all 6 sections + Navigation. Biggest lever after cutting the decorative 3D.
- **@react-three/drei is declared in `package.json` (^9.114.0) but imported nowhere** — pure dead weight; remove it (re-add only if Phase 5 needs it for the video-texture device).
- The current `ThreeScene` is exactly what the brief bans: wireframe icosahedron "blob" + 800-point starfield (`ParticleField`) + decorative rings. Cutting it reclaims the entire ~209 kB gz of three+fiber.

**`force-dynamic` Firestore cost (`app/page.tsx:11`):**
- The route is `ƒ` (server-rendered every request); **no Full Route Cache, no ISR.**
- Every request `await`s `getPortfolioData()` → `getFirestoreServer()` → `ref.get()` on `portfolio/main`, a live Firestore document read **on the critical path to first byte.** No HTML streams until it resolves.
- Cost = (cold start only) firebase-admin init + service-account cert parse, plus (every request) one Firestore read round-trip to GCP. On Vercel serverless: cold invocations add hundreds of ms of admin init; warm ones still pay the Firestore RTT (~50–150 ms typical). The connection is memoized; **the data is not** — it re-fetches every visit.
- The content only changes when the admin edits it, yet it is refetched for 100% of visitors. This directly inflates TTFB and LCP for the exact 90-second phone visitor the site targets.
- **Fix direction (Phase 1+):** drop `force-dynamic`; statically render + revalidate on-demand (`revalidatePath` from the admin save) or ISR. That removes the per-request Firestore read from TTFB entirely for cached hits.
- I did not time this against the live Firestore — a local RTT from here is not representative of Vercel→Firestore, and I did not want to touch production data. I can measure it live if you want, with that caveat.

---

## 5. Duplicate check — MyRef vs "My Representative"

- **They are the same app.** `com.myref.app` (the "MyRef" project's link) has store title **"Myrep," developer Jumatechs** — "Myrep" ≈ "My Representative." There is only **one** entry in the repo (`MyRef`), so there is nothing to merge on disk; the brief treated one app as two.
- The repo's naming is inconsistent with the store: code says **"MyRef,"** the store says **"Myrep,"** the brief says **"My Representative."** Pick one and match the store.
- **Recommendation:** keep a single project, title it to match the Play listing (**"Myrep"** or "My Representative"), attribute developer **Jumatechs**, keep the verified live link `com.myref.app`. Do not create a second "My Representative" entry.

---

## Other accuracy issues surfaced in passing (for Phase 1)

- **"No green" violation:** `defaults.ts:199` sets Bazzile `accent: 'from-signal-green/20 ...'`. `signal-green` is defined in `tailwind.config.ts`. Remove green everywhere.
- **Em dashes everywhere:** `defaults.ts` copy and the generated DOCX use `—` heavily (project titles `name — tagline`, `educationBlocks`). The "no em dash in the DOCX" rule needs a full sweep in Phase 1.
- **`/hire` does not exist yet** — the zero-contact-info rule applies to a route to be built later. Current contact info (email, phone, LinkedIn, GitHub) lives in the Contact section and CV.
- **"Live" is rendered verbatim from each link's `label`** (Projects.tsx) — there is no verified-status gate. Balanzify ("Live site," login wall), Playzone ("Live demo," preview URL), and Team Pharma ("Live site," down) should not carry a Live claim until the rule is met.
- Self-asserted stats with no link/number behind them: "20+ Apps shipped," "3 Senior roles," "7+ years" — flag for §6 copy review.

---

## Recommended decisions before Phase 1

1. **Canonical project set?** The repo's 11, or the brief's (GoStyle / Yalla Shisha / Pick&Go / Smart Pass / My Representative)? If the latter, I need their details + links — I will not invent them.
2. **Confirm Firestore vs `defaults.ts` as source of truth** for the accuracy fixes (the live `/api/portfolio` is auth-gated; I could not read raw live data).
3. **Sign off on the Bazzile numbers that ship:** Swiss + Geneva + real estate + 70k France (Sep 2023–Sep 2024) + both stores. **Cut:** 135k downloads, 350k listings, and the founding year.
