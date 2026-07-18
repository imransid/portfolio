import { CV_DOWNLOAD_PATH } from '@/lib/cv/download-path';
import type { PortfolioData } from '@/lib/portfolio/types';

type ContactProps = { data: PortfolioData['contact'] };

/**
 * Light instrument sheet (Phase 3). Server component: framer, useInView and the
 * lucide icon set are dropped in favour of a static mono "readout" of channels.
 * Contact values are direct links (ink, underlined), not verification links, so
 * indigo is intentionally not used here.
 */
export default function Contact({ data }: ContactProps) {
  return (
    <section
      id="contact"
      className="relative bg-sheet px-5 py-24 text-carbon md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-graphite">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          <span>{data.sectionLabel}</span>
        </div>

        <h2 className="max-w-[20ch] text-balance font-martian text-2xl font-bold leading-[1.2] text-carbon md:text-4xl">
          {data.headlineLine1} {data.headlineLine2Highlight} {data.headlineLine3}
          <br />
          <span className="italic">{data.headlineLine4Italic}</span>
        </h2>

        <p className="mt-10 max-w-[60ch] font-sans text-[15px] leading-relaxed text-carbon/80">
          {data.blurb}
        </p>

        <div className="mt-10 flex flex-col items-start gap-5">
          <a
            href={`mailto:${data.primaryEmail}`}
            className="w-max border-b-2 border-carbon pb-[3px] font-martian text-[13px] font-medium uppercase tracking-[0.04em] text-carbon transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-carbon"
          >
            Email me &rarr;
          </a>
          <a
            href={CV_DOWNLOAD_PATH}
            download
            className="w-max font-mono text-[11px] uppercase tracking-[0.14em] text-graphite underline decoration-line underline-offset-4 transition-colors hover:text-carbon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-carbon"
          >
            Download CV (Word)
          </a>
        </div>

        <div className="mt-16 border-t border-line pt-10">
          <ul className="flex flex-col gap-3 font-mono text-[12px] leading-relaxed">
            {data.channels.map((channel) => {
              const external = channel.href.startsWith('http');
              return (
                <li key={channel.label} className="flex items-baseline gap-3">
                  <span className="w-24 shrink-0 lowercase tracking-wide text-graphite">
                    {channel.label}
                  </span>
                  <span className="text-graphite" aria-hidden="true">
                    &rarr;
                  </span>
                  <a
                    href={channel.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    className="text-carbon underline decoration-line underline-offset-4 transition-colors hover:decoration-carbon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-carbon"
                  >
                    {channel.value}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
