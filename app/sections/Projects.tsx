import type { PortfolioData, Project, ProjectLink } from '@/lib/portfolio/types';

type ProjectsProps = { data: PortfolioData['projects'] };

/**
 * Light instrument sheet (Phase 3). Server component: framer, useInView and the
 * decorative gradient/SVG artwork are dropped. Status renders as a typographic
 * glyph (never a coloured fill) and every project link is treated as a proof
 * source, so the indigo verification colour is the only accent on the page.
 */

/** Status as a typographic glyph. Anything but Live / In production renders nothing. */
function StatusGlyph({ status }: { status?: string }) {
  if (status === 'Live') {
    return (
      <span className="font-mono text-[10px] text-carbon">
        <span aria-hidden="true">&#9679;</span> live
      </span>
    );
  }
  if (status === 'In production') {
    return (
      <span className="font-mono text-[10px] text-carbon">
        <span aria-hidden="true">&#9650;</span> in production
      </span>
    );
  }
  return null;
}

/** Verification links: quiet "proof" prefix, then each source in indigo with an arrow. */
function ProofLinks({ links }: { links: ProjectLink[] }) {
  const proof = links.filter((l) => l.label.trim().toLowerCase() !== 'live');
  if (proof.length === 0) return null;

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="font-mono text-[11px] text-graphite">proof</span>
      {proof.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[11px] text-signal-deep underline decoration-signal/40 underline-offset-2 transition-colors hover:decoration-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          {l.label} <span aria-hidden="true">{'↗'}</span>
        </a>
      ))}
    </span>
  );
}

/** Rich featured card: full description, all tech, all proof sources. */
function FeaturedCard({ project }: { project: Project }) {
  return (
    <article className="rounded-2xl border border-line bg-panel p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
          {project.category}
        </span>
        <StatusGlyph status={project.status} />
      </div>

      <h3 className="mt-5 text-balance font-martian text-2xl font-bold leading-tight text-carbon md:text-3xl">
        {project.name}
      </h3>
      <p className="mt-2 font-mono text-[12px] text-graphite">
        {project.tagline}
      </p>

      <p className="mt-5 max-w-[62ch] font-sans text-[15px] leading-relaxed text-carbon/80">
        {project.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {project.tech.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] text-graphite"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-5">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite">
          {project.period}
        </span>
        <ProofLinks links={project.links} />
      </div>
    </article>
  );
}

/** Compact card for the "more work" grid. */
function MoreCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col rounded-xl border border-line bg-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-graphite">
          {project.category}
        </span>
        <StatusGlyph status={project.status} />
      </div>

      <h4 className="mt-4 font-martian text-lg font-bold leading-tight text-carbon">
        {project.name}
      </h4>
      <p className="mt-1 font-mono text-[11px] text-graphite">
        {project.tagline}
      </p>

      <p className="mt-3 font-sans text-[13px] leading-relaxed text-carbon/80">
        {project.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] text-graphite"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-graphite">
          {project.period}
        </span>
        <ProofLinks links={project.links} />
      </div>
    </article>
  );
}

export default function Projects({ data }: ProjectsProps) {
  return (
    <section
      id="projects"
      className="relative bg-sheet px-5 py-24 text-carbon md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-graphite">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          <span>{data.sectionLabel}</span>
        </div>

        <h2 className="max-w-3xl text-balance font-martian text-2xl font-bold leading-[1.2] text-carbon md:text-4xl">
          {data.titleLead}
          {data.titleEmphasis}
          {data.titleMid}
          {data.titleTailItalic}
        </h2>

        <p className="mt-6 max-w-[60ch] font-sans text-[15px] leading-relaxed text-carbon/80">
          {data.aside}
        </p>

        <div className="mt-16 flex flex-col gap-6">
          {data.featured.map((project, i) => (
            <FeaturedCard key={`${project.name}-${i}`} project={project} />
          ))}
        </div>

        <div className="mt-24">
          <div className="mb-10 flex items-baseline justify-between gap-4 border-b border-line pb-5">
            <h3 className="font-martian text-xl font-bold leading-tight text-carbon md:text-2xl">
              {data.moreSectionTitleBefore}
              {data.moreSectionTitleEmphasis}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-graphite">
              {data.more.length} projects
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {data.more.map((project, i) => (
              <MoreCard key={`${project.name}-${i}`} project={project} />
            ))}
          </div>

          {data.archiveLine ? (
            <p className="mt-10 max-w-[70ch] font-mono text-[11px] leading-relaxed text-graphite">
              {data.archiveLine}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
