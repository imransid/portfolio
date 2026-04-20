# Imran Khan — Portfolio

A premium, editorial dark-luxe portfolio built with **Next.js 14 (App Router)**, **Three.js** (via `@react-three/fiber`), **Tailwind CSS**, and **Framer Motion**.

## Design direction

- **Editorial dark-luxe** — deep off-black (`#060606`) with a warm amber `#f5a524` accent. Not the usual cyan/purple cyberpunk slop.
- **Fraunces** (distinctive serif) for display, **Inter** for body, **JetBrains Mono** for labels and meta.
- Asymmetric grids, numbered section markers (01 — About, 02 — Work…), SVG grain overlay, animated hover underlines.
- Interactive 3D hero: a wireframe icosahedron that tracks your cursor, a counter-rotating inner core, floating torus rings, and an 800-particle sphere field.

## Getting started

Requires **Node.js 18.17+** (Next.js 14 requirement).

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Open http://localhost:3000
```

Build & production:

```bash
npm run build
npm run start
```

## Project structure

```
app/
├── layout.tsx              # Root layout, font variables, global styles
├── page.tsx                # Page composition
├── globals.css             # Design tokens, grain, animations, utilities
├── components/
│   ├── Navigation.tsx      # Top bar + mobile drawer, live Dhaka clock
│   ├── ThreeScene.tsx      # Three.js hero scene
│   └── Footer.tsx          # Giant-name footer + meta bar
└── sections/
    ├── Hero.tsx            # Editorial hero with 3D, CTAs, skills marquee
    ├── About.tsx           # Manifesto + stats
    ├── Experience.tsx      # Expandable timeline of roles
    ├── Projects.tsx        # 4 featured + 6 mini-cards
    ├── Skills.tsx          # 4 categorized skill groups
    └── Contact.tsx         # Big statement + channel grid
```

## Customizing

### Colors / theme
All design tokens live in `tailwind.config.ts` under `theme.extend.colors`. Change `amber.glow` to recolor the entire accent system.

### Fonts
`app/layout.tsx` loads three Google fonts as CSS variables. Swap any of them — for example, replace `Fraunces` with `Instrument Serif` for a thinner editorial feel, or `Inter` with [Geist](https://vercel.com/font) by installing `geist` and updating the import.

### 3D scene
`app/components/ThreeScene.tsx` is fully isolated. Swap `icosahedronGeometry` for `torusKnotGeometry`, change particle count, or tweak colors — all in one file.

### Projects
Edit the `FEATURED` and `MORE` arrays in `app/sections/Projects.tsx`. Each project takes a number, name, tagline, description, tech array, and links.

## Tech

| Layer           | Choice                                    |
| --------------- | ----------------------------------------- |
| Framework       | Next.js 14 (App Router)                   |
| Language        | TypeScript                                |
| Styling         | Tailwind CSS 3.4 with custom tokens       |
| 3D              | Three.js + @react-three/fiber + drei      |
| Animation       | Framer Motion                             |
| Icons           | lucide-react                              |
| Fonts           | Fraunces, Inter, JetBrains Mono (Google)  |

## Deployment

Deploys cleanly to **Vercel** out of the box — just push the repo and import. Also works on Netlify, Cloudflare Pages, and any Node host that supports Next 14.

```bash
# Vercel
npx vercel

# Or push to a Git host and import at vercel.com/new
```

## Performance notes

- The Three.js canvas is dynamically imported (`dynamic(..., { ssr: false })`) so it never blocks the initial HTML payload.
- `framer-motion` components use `whileInView` / `useInView` — scroll animations are cheap and only fire once.
- All fonts use `display: swap` to avoid FOIT.
- The grain overlay is a single inline-SVG data URI; no extra network request.

## License

Code: MIT. Content and personal branding: © Imran Khan.
