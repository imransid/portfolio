'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { PortfolioData, Project } from '@/lib/portfolio/types';

type ProjectsProps = { data: PortfolioData['projects'] };

function FeaturedCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reversed = index % 2 === 1;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid md:grid-cols-12 gap-6 md:gap-10 items-center"
    >
      <div
        className={`md:col-span-7 ${
          reversed ? 'md:order-2 md:col-start-6' : 'md:order-1 md:col-start-1'
        }`}
      >
        <div
          className={`relative aspect-[4/5] md:aspect-[5/6] rounded-2xl overflow-hidden border border-ink-border group`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${project.accent || 'from-transparent'} bg-ink-soft`}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink-deep via-transparent to-transparent" />

          <svg
            className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen"
            viewBox="0 0 400 500"
          >
            <defs>
              <linearGradient id={`g${index}`} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#f5a524" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f5f1e8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {Array.from({ length: 12 }).map((_, i) => (
              <circle
                key={i}
                cx="200"
                cy="250"
                r={40 + i * 18}
                fill="none"
                stroke={`url(#g${index})`}
                strokeWidth="0.5"
                opacity={1 - i * 0.07}
                className="transition-transform duration-1000 group-hover:scale-110"
                style={{ transformOrigin: 'center' }}
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[10rem] md:text-[14rem] leading-none text-bone/5 select-none">
              {project.number}
            </span>
          </div>

          <div className="absolute top-6 left-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-bone-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-glow" />
            {project.category}
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="font-display italic text-4xl md:text-5xl leading-tight text-bone">
              {project.name}
            </h3>
          </div>
        </div>
      </div>

      <div
        className={`md:col-span-5 ${
          reversed ? 'md:order-1 md:col-start-1 md:row-start-1' : 'md:order-2 md:col-start-8'
        }`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-glow mb-4">
          {project.number} — Featured project
        </p>
        <h4 className="font-display text-3xl md:text-4xl leading-tight mb-4">
          {project.tagline}
        </h4>
        <p className="text-bone-soft leading-relaxed mb-8">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {project.tech.map((t) => (
            <span
              key={t}
              className="px-3 py-1.5 text-xs rounded-full border border-ink-border text-bone-soft font-mono"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-widest text-bone-muted">
            {project.period}
          </span>
          {project.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 hover-line text-bone"
            >
              {l.label}
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function MiniCard({ project }: { project: Project }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="group relative p-6 md:p-8 rounded-xl border border-ink-border bg-ink-soft/30 hover:bg-ink-soft/60 hover:border-amber-glow/40 transition-all duration-500"
    >
      <div className="flex items-start justify-between mb-6">
        <span className="font-mono text-[10px] uppercase tracking-widest text-amber-glow">
          {project.number}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-bone-muted">
          {project.category}
        </span>
      </div>

      <h4 className="font-display text-2xl md:text-3xl leading-tight mb-1">
        {project.name}
      </h4>
      <p className="font-display italic text-bone-muted mb-5">
        {project.tagline}
      </p>
      <p className="text-sm text-bone-soft leading-relaxed mb-6 line-clamp-3">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {project.tech.slice(0, 4).map((t) => (
          <span
            key={t}
            className="px-2.5 py-1 text-[10px] rounded-full border border-ink-border text-bone-muted font-mono"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-bone-muted">{project.period}</span>
        <div className="flex gap-3">
          {project.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="group/l inline-flex items-center gap-1 text-bone hover:text-amber-glow transition-colors"
            >
              {l.label}
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover/l:translate-x-0.5 group-hover/l:-translate-y-0.5" />
            </a>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects({ data }: ProjectsProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="projects"
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-10 overflow-hidden"
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

        <div className="grid md:grid-cols-12 gap-6 items-end">
          <h2 className="md:col-span-8 font-display text-display-md text-balance leading-[1.05]">
            {data.titleLead}
            <span className="italic font-light text-amber-glow">
              {data.titleEmphasis}
            </span>
            {data.titleMid}
            <span className="italic font-light text-bone-soft">
              {data.titleTailItalic}
            </span>
          </h2>
          <div className="md:col-span-4 text-bone-muted text-sm leading-relaxed">
            <p>{data.aside}</p>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-[1600px] mt-24 md:mt-32 space-y-28 md:space-y-40">
        {data.featured.map((p, i) => (
          <FeaturedCard key={`${p.name}-${i}`} project={p} index={i} />
        ))}
      </div>

      <div className="mx-auto max-w-[1600px] mt-32 md:mt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex items-baseline justify-between mb-12 pb-6 border-b border-ink-border"
        >
          <h3 className="font-display text-3xl md:text-4xl">
            {data.moreSectionTitleBefore}
            <span className="italic font-light text-amber-glow">
              {data.moreSectionTitleEmphasis}
            </span>
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-widest text-bone-muted">
            {data.more.length} projects
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.more.map((p) => (
            <MiniCard key={p.name} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
