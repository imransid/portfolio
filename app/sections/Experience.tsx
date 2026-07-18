import type { PortfolioData } from '@/lib/portfolio/types';

type ExperienceProps = { data: PortfolioData['experience'] };

/**
 * Light instrument sheet (Phase 3). Server component: the accordion and framer
 * are dropped in favour of a static, fully-legible timeline (three roles do not
 * need progressive disclosure, and the numbered bullet markers were decorative).
 * Role dates are gated for no-overlap at build time by scripts/check-data.mjs.
 */
export default function Experience({ data }: ExperienceProps) {
  return (
    <section
      id="experience"
      className="relative bg-panel px-5 py-24 text-carbon md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-graphite">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          <span>{data.sectionLabel}</span>
        </div>

        <h2 className="max-w-3xl text-balance font-martian text-2xl font-bold leading-[1.2] text-carbon md:text-4xl">
          {data.titleLead}
          {data.titleEmphasis}
          {data.titleTail}
        </h2>

        <div className="mt-16 flex flex-col">
          {data.roles.map((role, i) => (
            <div
              key={`${role.company}-${i}`}
              className="grid gap-x-8 gap-y-4 border-t border-line py-10 last:border-b md:grid-cols-12"
            >
              <div className="md:col-span-4">
                <div className="font-mono text-[11px] uppercase tracking-widest text-graphite">
                  {role.period}
                </div>
                <h3 className="mt-2 font-martian text-xl font-bold leading-tight text-carbon md:text-2xl">
                  {role.company}
                </h3>
                <div className="mt-1 font-mono text-[12px] text-graphite">
                  {role.title}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {role.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] text-graphite"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="flex flex-col gap-3 md:col-span-8">
                {role.bullets.map((bullet, bi) => (
                  <li
                    key={bi}
                    className="flex gap-3 font-sans text-[14px] leading-relaxed text-carbon/80"
                  >
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-graphite"
                      aria-hidden="true"
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
