import type { PortfolioData } from '@/lib/portfolio/types';

type HireFooterProps = { data: PortfolioData['footer']; upworkUrl: string };

/**
 * Hire-page footer. Same instrument-sheet look as the main footer but with the
 * contact links (GitHub, LinkedIn, Email) removed: the only outbound link is the
 * Upwork CTA, so /hire stays contact-free end to end.
 */
export default function HireFooter({ data, upworkUrl }: HireFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line bg-sheet text-carbon">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-10 md:py-28">
        <h2 className="text-balance font-martian text-4xl font-bold leading-[1.05] text-carbon md:text-6xl">
          {data.firstName} {data.lastName}.
        </h2>

        <div className="mt-16 flex flex-col items-start justify-between gap-8 border-t border-line pt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-graphite md:mt-20 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <span>
              &copy; {year} {data.copyrightName}
            </span>
            <span>{data.builtLine}</span>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={upworkUrl}
              target="_blank"
              rel="noreferrer"
              className="text-carbon underline decoration-line underline-offset-4 transition-colors hover:decoration-carbon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-carbon"
            >
              Hire me on Upwork
            </a>
            <a
              href="#top"
              aria-label="Back to top"
              className="text-carbon underline decoration-line underline-offset-4 transition-colors hover:decoration-carbon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-carbon"
            >
              Top &uarr;
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
