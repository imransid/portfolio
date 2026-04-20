'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { PortfolioData } from '@/lib/portfolio/types';

type ExperienceProps = { data: PortfolioData['experience'] };

export default function Experience({ data }: ExperienceProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="experience"
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

        <h2 className="font-display text-display-md text-balance max-w-4xl leading-[1.05]">
          {data.titleLead}
          <span className="italic font-light text-amber-glow">
            {data.titleEmphasis}
          </span>
          {data.titleTail}
        </h2>
      </motion.div>

      <div className="mx-auto max-w-[1600px] mt-24 md:mt-32">
        {data.roles.map((role, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={`${role.company}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
              className="border-t border-ink-border last:border-b"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full group py-8 md:py-10 text-left flex items-center gap-6 md:gap-10 transition-colors hover:bg-ink-soft/30 -mx-6 md:-mx-10 px-6 md:px-10"
              >
                <span className="hidden md:block font-mono text-[11px] uppercase tracking-widest text-bone-muted w-24 shrink-0">
                  {role.years}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="font-display text-3xl md:text-5xl leading-tight">
                      {role.company}
                    </h3>
                    <span className="font-display italic text-bone-muted text-lg md:text-xl">
                      — {role.title}
                    </span>
                  </div>
                  <p className="md:hidden mt-1 font-mono text-[10px] uppercase tracking-widest text-bone-muted">
                    {role.period}
                  </p>
                </div>

                <span className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-bone-muted shrink-0">
                  {role.period}
                </span>
                <span
                  className={`shrink-0 w-10 h-10 rounded-full border border-bone/20 flex items-center justify-center transition-all duration-300 group-hover:border-amber-glow group-hover:text-amber-glow ${
                    isOpen ? 'bg-amber-glow text-ink-deep border-amber-glow' : ''
                  }`}
                >
                  {isOpen ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </span>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: isOpen ? 'auto' : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pb-12 md:pb-16 grid md:grid-cols-12 gap-8 md:pl-[calc(6rem+2.5rem)]">
                  <div className="md:col-span-8">
                    <ul className="space-y-4">
                      {role.bullets.map((b, bi) => (
                        <li
                          key={bi}
                          className="flex gap-4 text-bone-soft leading-relaxed"
                        >
                          <span className="shrink-0 font-mono text-[10px] text-amber-glow pt-2">
                            0{bi + 1}
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:col-span-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-4">
                      Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {role.tech.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1.5 text-xs rounded-full border border-ink-border text-bone-soft"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
