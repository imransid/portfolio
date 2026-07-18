import type { PortfolioData } from '@/lib/portfolio/types';

type AboutProps = { data: PortfolioData['about'] };

/** Light instrument sheet (Phase 3). Server component, no framer, no WebGL. */
export default function About({ data }: AboutProps) {
  return (
    <section
      id="about"
      className="relative bg-sheet px-5 py-24 text-carbon md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-graphite md:mb-24">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          <span>{data.sectionLabel}</span>
        </div>

        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-4">
            {data.manifestoBody ? (
              <p className="max-w-[24ch] font-mono text-[11px] leading-loose text-graphite lg:sticky lg:top-24">
                {data.manifestoBody}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-8">
            <h2 className="max-w-[20ch] text-balance font-martian text-2xl font-bold leading-[1.2] text-carbon md:text-4xl">
              {data.headlineLine1Before}
              {data.headlineLine1Highlight}.
              <br />
              {data.headlineLine2}
              <br />
              {data.headlineLine3Italic}
            </h2>

            <div className="mt-12 grid max-w-3xl gap-8 font-sans text-[15px] leading-relaxed text-carbon/80 md:grid-cols-2">
              {data.bodyParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {data.affiliation ? (
              <p className="mt-8 max-w-3xl font-sans text-[15px] leading-relaxed text-carbon/80">
                {data.affiliation.lead}
                <a
                  href={data.affiliation.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-signal-deep underline decoration-signal/40 underline-offset-2 transition-colors hover:decoration-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  {data.affiliation.linkLabel}
                </a>
                {data.affiliation.tail}
              </p>
            ) : null}

            <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 md:grid-cols-4">
              {data.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dd className="font-mono text-4xl font-bold leading-none tabular-nums text-carbon md:text-5xl">
                    {stat.n}
                  </dd>
                  <dt className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-widest text-graphite">
                    {stat.label}
                  </dt>
                  {stat.source ? (
                    <a
                      href={stat.source}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex w-max items-center gap-1 font-mono text-[10px] text-signal-deep underline decoration-signal/40 underline-offset-2 hover:decoration-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      source &#8599;
                    </a>
                  ) : null}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
