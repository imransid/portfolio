'use client';

import { useEffect, useState } from 'react';
import { FileDown, Menu, X } from 'lucide-react';
import { CV_DOWNLOAD_PATH } from '@/lib/cv/download-path';
import type { PortfolioData } from '@/lib/portfolio/types';

type NavProps = { data: PortfolioData['navigation'] };

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-carbon';

/**
 * Light instrument-sheet navigation (Phase 3). Kept as a client component only
 * for the mobile menu and the scroll-to-backdrop state (the one place the design
 * system permits it). framer-motion is dropped in favour of CSS transitions, the
 * live clock and green availability ping are gone, and numbered eyebrows are
 * dropped. Text is ink on the light sheet so it stays legible over the hero.
 */
export default function Navigation({ data }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 motion-reduce:transition-none ${
          scrolled
            ? 'border-line bg-sheet'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20 md:px-10">
          <a
            href="#top"
            className={`group flex items-center gap-3 rounded-sm ${focusRing}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel font-mono text-[11px] tracking-wider text-carbon transition-colors duration-300 group-hover:border-carbon motion-reduce:transition-none">
              {data.brandMonogram}
            </span>
            <span className="hidden font-mono text-[13px] tracking-tight text-carbon sm:inline">
              {data.brandName}
            </span>
          </a>

          <div className="hidden items-center gap-6 md:flex">
            <nav aria-label="Primary" className="flex items-center gap-5">
              {data.navItems.map((item) => (
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
              href={CV_DOWNLOAD_PATH}
              download
              className={`inline-flex items-center gap-1.5 rounded-sm font-mono text-[11px] uppercase tracking-[0.14em] text-graphite underline-offset-4 transition-colors duration-200 hover:text-carbon hover:underline motion-reduce:transition-none ${focusRing}`}
            >
              <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
              CV
            </a>

            <span className="h-4 w-px bg-line" aria-hidden="true" />

            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-carbon opacity-70"
                  aria-hidden="true"
                />
                {data.availabilityLabel}
              </span>
              <span>{data.timezoneCity}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className={`rounded-sm p-2 text-carbon md:hidden ${focusRing}`}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] flex flex-col bg-sheet text-carbon transition-[opacity,visibility] duration-300 motion-reduce:transition-none md:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <span className="font-mono text-[13px] tracking-tight text-carbon">
            {data.brandName}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className={`rounded-sm p-2 text-carbon ${focusRing}`}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col px-5 py-6">
          {data.navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`border-b border-line py-5 font-martian text-2xl font-bold text-carbon transition-colors duration-200 hover:text-graphite motion-reduce:transition-none ${focusRing}`}
            >
              {item.label}
            </a>
          ))}
          <a
            href={CV_DOWNLOAD_PATH}
            download
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 border-b border-line py-5 font-mono text-sm uppercase tracking-[0.14em] text-graphite transition-colors duration-200 hover:text-carbon motion-reduce:transition-none ${focusRing}`}
          >
            <FileDown className="h-4 w-4 shrink-0" aria-hidden="true" />
            Download CV
          </a>
        </nav>

        <div className="mt-auto flex items-center gap-3 px-5 pb-10 font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
          <span className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-carbon opacity-70"
              aria-hidden="true"
            />
            {data.availabilityLabel}
          </span>
          <span>{data.timezoneCity}</span>
        </div>
      </div>
    </>
  );
}
