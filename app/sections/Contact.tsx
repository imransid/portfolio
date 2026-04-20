'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowUpRight,
  FileDown,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
} from 'lucide-react';
import { CV_DOWNLOAD_PATH } from '@/lib/cv/download-path';
import type { ContactChannelIcon, PortfolioData } from '@/lib/portfolio/types';

type ContactProps = { data: PortfolioData['contact'] };

const ICONS: Record<
  ContactChannelIcon,
  typeof Mail
> = {
  mail: Mail,
  phone: Phone,
  linkedin: Linkedin,
  github: Github,
  map: MapPin,
};

export default function Contact({ data }: ContactProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const gridChannels = data.channels.slice(1);

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-10 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-amber-glow/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-muted mb-16"
        >
          <span className="w-10 h-px bg-amber-glow" />
          <span className="text-amber-glow">{data.sectionNum}</span>
          <span>— {data.sectionLabel}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 md:mb-28"
        >
          <h2 className="font-display text-display-lg text-balance leading-[0.95]">
            {data.headlineLine1}{' '}
            <span className="italic font-light text-amber-glow">
              {data.headlineLine2Highlight}
            </span>
            <br />
            {data.headlineLine3.endsWith('?') ? (
              <>
                {data.headlineLine3.slice(0, -1)}
                <span className="text-amber-glow">?</span>
              </>
            ) : (
              data.headlineLine3
            )}
            <br />
            <span className="italic font-light text-bone-soft">
              {data.headlineLine4Italic}
            </span>
          </h2>
          <p className="mt-10 max-w-xl text-bone-soft leading-relaxed">
            {data.blurb}
          </p>
          <motion.a
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            href={CV_DOWNLOAD_PATH}
            download
            className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-bone/20 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-bone-muted transition hover:border-amber-glow/40 hover:text-bone"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            Download CV (Word)
          </motion.a>
        </motion.div>

        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          href={`mailto:${data.primaryEmail}`}
          className="group relative block mb-20 md:mb-28"
        >
          <div className="border-t border-b border-ink-border py-10 md:py-14 flex items-center justify-between gap-6 transition-colors group-hover:border-amber-glow/40">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-muted mb-3">
                {data.primaryEmailLabel}
              </p>
              <p className="font-display text-2xl sm:text-4xl md:text-6xl truncate group-hover:text-amber-glow transition-colors">
                {data.primaryEmail}
              </p>
            </div>
            <span className="shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-full border border-bone/20 flex items-center justify-center group-hover:border-amber-glow group-hover:bg-amber-glow group-hover:text-ink-deep transition-all duration-500">
              <ArrowUpRight className="w-5 h-5 md:w-7 md:h-7 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </motion.a>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gridChannels.map((c, i) => {
            const Icon = ICONS[c.icon] ?? Mail;
            return (
              <motion.a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                className="group p-6 rounded-xl border border-ink-border bg-ink-soft/30 hover:bg-ink-soft/60 hover:border-amber-glow/40 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-8">
                  <Icon className="w-5 h-5 text-bone-muted group-hover:text-amber-glow transition-colors" />
                  <ArrowUpRight className="w-4 h-4 text-bone-muted transition-all group-hover:text-amber-glow group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-muted mb-2">
                  {c.label}
                </p>
                <p className="font-display text-lg md:text-xl text-bone truncate">
                  {c.value}
                </p>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
