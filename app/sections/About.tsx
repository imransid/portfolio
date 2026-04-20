'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import type { PortfolioData } from '@/lib/portfolio/types';

type AboutProps = { data: PortfolioData['about'] };

export default function About({ data }: AboutProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-10 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-[1600px]"
      >
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-muted mb-20 md:mb-32">
          <span className="w-10 h-px bg-amber-glow" />
          <span className="text-amber-glow">{data.sectionNum}</span>
          <span>— {data.sectionLabel}</span>
        </div>
      </motion.div>

      <div className="mx-auto max-w-[1600px] grid lg:grid-cols-12 gap-y-20 gap-x-10">
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="sticky top-28 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-muted"
          >
            <p className="mb-6">
              <span className="text-amber-glow">✶</span> {data.manifestoKicker}
            </p>
            <p className="leading-loose text-bone-dim max-w-[20ch]">
              {data.manifestoBody}
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-9 lg:pl-10">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.1 }}
            className="font-display text-display-md text-balance leading-[1.05]"
          >
            {data.headlineLine1Before}
            <span className="italic font-light text-amber-glow">
              {data.headlineLine1Highlight}
            </span>
            <span className="text-amber-glow">.</span>
            <br />
            {data.headlineLine2}
            <br />
            <span className="italic font-light text-bone-soft">
              {data.headlineLine3Italic}
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-16 grid md:grid-cols-2 gap-10 text-bone-soft leading-relaxed max-w-3xl"
          >
            {data.bodyParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
            }}
            className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 gap-y-10 border-t border-ink-border pt-10"
          >
            {data.stats.map((s) => (
              <motion.div
                key={s.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                className="flex flex-col"
              >
                <span className="font-display text-5xl md:text-6xl text-bone leading-none">
                  {s.n}
                </span>
                <span className="mt-2 font-mono text-[10px] uppercase tracking-widest text-bone-muted">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
