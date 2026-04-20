'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { PortfolioData, SkillLevel } from '@/lib/portfolio/types';

type SkillsProps = { data: PortfolioData['skills'] };

const LEVEL_DOT: Record<SkillLevel, string> = {
  Primary: 'bg-amber-glow',
  Strong: 'bg-bone',
  Working: 'bg-bone-muted',
};

export default function Skills({ data }: SkillsProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="skills"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-10 bg-ink"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-[1600px]"
      >
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-muted mb-16">
          <span className="w-10 h-px bg-amber-glow" />
          <span className="text-amber-glow">{data.sectionNum}</span>
          <span>— {data.sectionLabel}</span>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          <h2 className="md:col-span-8 font-display text-display-md text-balance leading-[1.05]">
            {data.titleLead}
            <span className="italic font-light text-amber-glow">
              {data.titleEmphasis}
            </span>
            {data.titleTail}
          </h2>
          <div className="md:col-span-4 flex md:justify-end items-end">
            <div className="flex flex-col gap-2 text-xs font-mono">
              <span className="flex items-center gap-2 text-bone">
                <span className="w-2 h-2 rounded-full bg-amber-glow" />
                {data.legendPrimary}
              </span>
              <span className="flex items-center gap-2 text-bone">
                <span className="w-2 h-2 rounded-full bg-bone" />
                {data.legendStrong}
              </span>
              <span className="flex items-center gap-2 text-bone-muted">
                <span className="w-2 h-2 rounded-full bg-bone-muted" />
                {data.legendWorking}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-[1600px] mt-24 md:mt-32 grid md:grid-cols-2 gap-x-16 gap-y-20">
        {data.groups.map((group, gi) => (
          <motion.div
            key={group.heading}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 + gi * 0.1 }}
          >
            <div className="flex items-baseline justify-between pb-4 mb-6 border-b border-ink-border">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-glow">
                  {group.label}
                </span>
                <h3 className="font-display text-3xl md:text-4xl">
                  {group.heading}
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-bone-muted">
                {group.items.length}
              </span>
            </div>

            <ul className="divide-y divide-ink-border/60">
              {group.items.map((it, ii) => (
                <motion.li
                  key={it.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + gi * 0.05 + ii * 0.03 }}
                  className="group flex items-center justify-between py-3 hover:pl-2 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${LEVEL_DOT[it.level]}`}
                    />
                    <span className="text-bone group-hover:text-amber-glow transition-colors text-lg">
                      {it.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-bone-muted">
                    {it.level}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mx-auto max-w-[1600px] mt-24 md:mt-32 pt-12 border-t border-ink-border flex flex-wrap items-center gap-x-10 gap-y-4"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-muted">
          {data.languagesLabel}
        </span>
        {data.languages.map((lang) => (
          <span key={lang.name} className="font-display italic text-xl">
            {lang.name}{' '}
            <span className="text-bone-muted text-sm">— {lang.note}</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}
