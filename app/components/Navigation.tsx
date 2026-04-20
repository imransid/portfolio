'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Menu, X } from 'lucide-react';
import { CV_DOWNLOAD_PATH } from '@/lib/cv/download-path';
import type { PortfolioData } from '@/lib/portfolio/types';

type NavProps = { data: PortfolioData['navigation'] };

export default function Navigation({ data }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: data.timeZone || 'Asia/Dhaka',
        hour12: false,
      });
      setTime(fmt.format(now));
    };
    tick();
    const id = setInterval(tick, 1000 * 30);
    return () => clearInterval(id);
  }, [data.timeZone]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-ink-deep/70 backdrop-blur-xl border-b border-ink-border'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <a
            href="#top"
            className="group flex items-center gap-3 font-display text-xl tracking-tight"
          >
            <span className="relative w-9 h-9 rounded-full border border-bone/30 flex items-center justify-center overflow-hidden">
              <span className="absolute inset-0 bg-amber-glow translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <span className="relative z-10 font-mono text-[11px] tracking-wider transition-colors duration-500 group-hover:text-ink-deep">
                {data.brandMonogram}
              </span>
            </span>
            <span className="hidden sm:inline italic">{data.brandName}</span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {data.navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2 text-sm tracking-wide"
              >
                <span className="font-mono text-[10px] text-bone-muted mr-1.5 align-top">
                  {item.num}
                </span>
                <span className="hover-line">{item.label}</span>
              </a>
            ))}
            <a
              href={CV_DOWNLOAD_PATH}
              download
              className="group inline-flex items-center gap-2 rounded-full border border-bone/15 px-4 py-2 text-sm tracking-wide text-bone-muted transition hover:border-amber-glow/40 hover:text-bone"
            >
              <FileDown className="h-4 w-4 opacity-80 group-hover:opacity-100" aria-hidden />
              CV
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4 font-mono text-[11px] text-bone-muted uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-green opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-signal-green" />
              </span>
              {data.availabilityLabel}
            </span>
            <span>
              {data.timezoneCity} {time}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="md:hidden p-2"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink-deep md:hidden"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-ink-border">
              <span className="font-display italic text-xl">{data.brandName}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-6 py-10 flex flex-col">
              {data.navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="group flex items-baseline gap-4 py-5 border-b border-ink-border"
                >
                  <span className="font-mono text-[11px] text-bone-muted">
                    {item.num}
                  </span>
                  <span className="font-display text-4xl group-hover:text-amber-glow transition-colors">
                    {item.label}
                  </span>
                </motion.a>
              ))}
              <motion.a
                href={CV_DOWNLOAD_PATH}
                download
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + data.navItems.length * 0.06 }}
                className="group flex items-center gap-3 py-5 border-b border-ink-border text-bone-muted hover:text-amber-glow"
              >
                <FileDown className="h-5 w-5 shrink-0" aria-hidden />
                <span className="font-display text-2xl">Download CV (.docx)</span>
              </motion.a>
            </nav>
            <div className="absolute bottom-10 left-6 right-6 font-mono text-[11px] text-bone-muted uppercase tracking-widest flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-green" />
                {data.availabilityLabel}
              </span>
              <span>
                {data.timezoneCity} {time}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
