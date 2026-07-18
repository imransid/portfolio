import { deriveTopology } from '@/lib/portfolio/topology';
import type { PortfolioData } from '@/lib/portfolio/types';

type HeroProps = {
  site: PortfolioData['site'];
  hero: PortfolioData['hero'];
  projects: PortfolioData['projects'];
};

/**
 * Light "instrument sheet" hero (Phase 3). Server component: zero client JS,
 * no WebGL, no framer-motion. The production map and the status tally are both
 * derived from the real project data (see lib/portfolio/topology.ts), so the
 * counts are auditable against the cards and can never drift from the pills.
 */
export default function Hero({ site, hero, projects }: HeroProps) {
  const { spine, tally } = deriveTopology(projects);
  const brand = `${site.firstName} ${site.lastName}`.trim().toLowerCase();
  const role = site.roleTagline.trim().toLowerCase();

  return (
    <section
      id="top"
      className="relative w-full overflow-hidden bg-sheet text-carbon"
    >
      <div className="hero-rise mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-5 pb-16 pt-24 md:max-w-4xl md:gap-10 md:px-10 md:pt-32">
        <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-graphite">
          {brand} · {role}
        </div>

        <h1 className="text-balance font-martian text-[26px] font-bold uppercase leading-[1.16] tracking-[0.005em] text-carbon md:text-5xl md:leading-[1.08]">
          {hero.headline}
        </h1>

        <section
          aria-label="Production map"
          className="rounded-2xl border border-line bg-panel p-4 md:p-6"
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-graphite">
            <span>Production map</span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>
          <p className="mt-3 max-w-[52ch] font-mono text-[11px] leading-relaxed text-graphite md:text-xs">
            Each row: a technology, then every product that uses it.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {spine.map((hub) => (
              <li key={hub.tech} className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[13px] font-medium text-carbon">
                    {hub.tech}
                  </span>
                  <span className="font-mono text-[13px] font-bold tabular-nums text-carbon">
                    &times;{hub.degree}
                  </span>
                </div>
                <div className="font-mono text-[11px] leading-normal text-graphite">
                  {hub.products.join(' · ')}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] tabular-nums text-graphite">
            {tally.total} products · {tally.live} live · {tally.inProduction} in
            production
          </p>
          <a
            href={hero.ctaPrimaryHref}
            className="w-max border-b-2 border-carbon pb-[3px] font-martian text-[13px] font-medium uppercase tracking-[0.04em] text-carbon transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-carbon"
          >
            {hero.ctaPrimaryLabel} &rarr;
          </a>
          <p className="flex items-center gap-2 font-mono text-[11px] text-graphite">
            <span
              className="h-1.5 w-1.5 rounded-full bg-carbon opacity-70"
              aria-hidden="true"
            />
            available for contract work
          </p>
        </div>
      </div>
    </section>
  );
}
