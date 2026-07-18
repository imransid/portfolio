import type { PortfolioData } from '@/lib/portfolio/types';

type HireNavProps = {
  data: PortfolioData['navigation'];
  upworkUrl: string;
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-carbon';

// Only anchors that exist on /hire. Contact is intentionally excluded: the hire
// page carries zero contact info, so it never links to a contact-bearing section
// and never links back to the contact-bearing home route.
const hireAnchors = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Stack', href: '#skills' },
];

/**
 * Hire-page navigation. Server component (no mobile menu, no client JS): the only
 * action is the Upwork CTA, kept visible at all times. Opaque sheet background so
 * scrolled content never bleeds under it. Deliberately no CV link, no contact
 * anchors and no link to the contact-bearing home route.
 */
export default function HireNav({ data, upworkUrl }: HireNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-sheet">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-10">
        <a href="#top" className={`group flex items-center gap-3 rounded-sm ${focusRing}`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel font-mono text-[11px] tracking-wider text-carbon transition-colors duration-300 group-hover:border-carbon motion-reduce:transition-none">
            {data.brandMonogram}
          </span>
          <span className="hidden font-mono text-[13px] tracking-tight text-carbon sm:inline">
            {data.brandName}
          </span>
        </a>

        <div className="flex items-center gap-6">
          <nav aria-label="Primary" className="hidden items-center gap-5 md:flex">
            {hireAnchors.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-sm font-mono text-[11px] uppercase tracking-[0.14em] text-graphite underline-offset-4 transition-colors duration-200 hover:text-carbon hover:underline motion-reduce:transition-none ${focusRing}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href={upworkUrl}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-sm bg-carbon px-3.5 py-2 font-martian text-[11px] font-medium uppercase tracking-[0.08em] text-sheet transition-opacity duration-200 hover:opacity-80 motion-reduce:transition-none ${focusRing}`}
          >
            Hire me on Upwork &rarr;
          </a>
        </div>
      </div>
    </header>
  );
}
