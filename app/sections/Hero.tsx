'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ArrowUpRight, ArrowDown, FileDown } from 'lucide-react';
import { CV_DOWNLOAD_PATH } from '@/lib/cv/download-path';
import type { PortfolioData } from '@/lib/portfolio/types';

type HeroProps = Pick<PortfolioData, 'site' | 'hero'>;

const ThreeScene = dynamic(() => import('../components/ThreeScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-ink-deep" />,
});

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.4 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero({ site, hero }: HeroProps) {
  const marqueeLoop = [...hero.marqueeSkills, ...hero.marqueeSkills];

  return (
    <section
      id="top"
      className="relative min-h-screen w-full overflow-hidden pt-24 md:pt-32"
    >
      <ThreeScene />

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-ink-deep/20 to-ink-deep" />

      <div className="relative z-20 mx-auto max-w-[1600px] px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-between font-mono text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-bone-muted mb-16 md:mb-24"
        >
          <span className="flex items-center gap-2">
            <span className="w-6 h-px bg-bone-muted" />
            {hero.portfolioLine}
          </span>
          <span className="hidden sm:block">
            {site.experienceMeta}{' '}
            <span className="dot-divider" /> {site.experienceFocus}
          </span>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <motion.p
            variants={item}
            className="font-mono text-xs md:text-sm text-amber-glow uppercase tracking-[0.3em] mb-6"
          >
            → {site.roleTagline}
          </motion.p>

          <motion.h1
            variants={item}
            className="font-display text-display-xl text-balance leading-[0.88] mb-4"
          >
            <span className="block">{site.firstName}</span>
            <span className="block italic font-light text-bone-soft">
              {site.lastName}
              <span className="text-amber-glow">.</span>
            </span>
          </motion.h1>

          <motion.div
            variants={item}
            className="mt-10 md:mt-14 max-w-xl grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm md:text-base"
          >
            <span className="font-mono text-[10px] text-bone-muted uppercase tracking-widest pt-1">
              Bio
            </span>
            <p className="text-bone-soft leading-relaxed text-balance">
              {site.bio}
            </p>

            <span className="font-mono text-[10px] text-bone-muted uppercase tracking-widest pt-1">
              Based
            </span>
            <p className="text-bone-soft">{site.location}</p>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 md:mt-16 flex flex-wrap items-center gap-4"
          >
            <a
              href={hero.ctaPrimaryHref}
              className="group relative inline-flex items-center gap-3 px-6 py-3.5 bg-amber-glow text-ink-deep rounded-full font-medium text-sm tracking-wide overflow-hidden"
            >
              <span className="absolute inset-0 bg-bone translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <span className="relative z-10">{hero.ctaPrimaryLabel}</span>
              <ArrowUpRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href={hero.ctaSecondaryHref}
              className="group inline-flex items-center gap-3 px-6 py-3.5 border border-bone/20 rounded-full font-medium text-sm tracking-wide hover:border-bone/50 transition-colors"
            >
              {hero.ctaSecondaryLabel}
              <span className="w-1.5 h-1.5 rounded-full bg-signal-green group-hover:scale-150 transition-transform" />
            </a>
            <a
              href={CV_DOWNLOAD_PATH}
              download
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 border border-bone/15 rounded-full font-medium text-sm tracking-wide text-bone-muted hover:border-amber-glow/35 hover:text-bone transition-colors"
            >
              <FileDown className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100" aria-hidden />
              Download CV
            </a>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 left-0 right-0 z-20 overflow-hidden border-y border-ink-border/50 bg-ink-deep/40 backdrop-blur-sm">
          <div className="marquee-track py-3 font-display italic text-2xl md:text-3xl text-bone/70">
            {marqueeLoop.map((skill, i) => (
              <span key={`${skill}-${i}`} className="flex items-center gap-16 shrink-0">
                {skill}
                <span className="w-1.5 h-1.5 rounded-full bg-amber-glow" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="hidden lg:flex absolute bottom-28 right-10 z-20 flex-col items-center gap-2 text-bone-muted font-mono text-[10px] uppercase tracking-widest"
      >
        <span>Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-3 h-3" />
        </motion.div>
      </motion.a>
    </section>
  );
}
