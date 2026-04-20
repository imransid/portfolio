'use client';

import { ArrowUp } from 'lucide-react';
import type { PortfolioData } from '@/lib/portfolio/types';

type FooterProps = { data: PortfolioData['footer'] };

export default function Footer({ data }: FooterProps) {
  return (
    <footer className="relative border-t border-ink-border bg-ink-deep overflow-hidden">
      <div className="px-6 md:px-10 pt-20 md:pt-28 pb-10">
        <div className="mx-auto max-w-[1600px]">
          <h2 className="font-display text-[clamp(4rem,22vw,20rem)] leading-[0.85] tracking-[-0.04em] text-balance">
            <span className="block">{data.firstName}</span>
            <span className="block italic font-light text-bone-soft">
              {data.lastName}
              <span className="text-amber-glow">.</span>
            </span>
          </h2>
        </div>
      </div>

      <div className="border-t border-ink-border px-6 md:px-10 py-8">
        <div className="mx-auto max-w-[1600px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-bone-muted">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <span>
              © {new Date().getFullYear()} {data.copyrightName}
            </span>
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-green opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-signal-green" />
              </span>
              {data.statusLabel}
            </span>
            <span>{data.builtLine}</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={data.githubHref}
              target="_blank"
              rel="noreferrer"
              className="hover-line"
            >
              GitHub
            </a>
            <a
              href={data.linkedinHref}
              target="_blank"
              rel="noreferrer"
              className="hover-line"
            >
              LinkedIn
            </a>
            <a href={data.emailHref} className="hover-line">
              Email
            </a>
            <a
              href="#top"
              className="inline-flex items-center gap-2 group"
              aria-label="Back to top"
            >
              Top
              <span className="w-6 h-6 rounded-full border border-bone/20 flex items-center justify-center group-hover:border-amber-glow group-hover:text-amber-glow transition-colors">
                <ArrowUp className="w-3 h-3" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
