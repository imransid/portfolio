import type { PortfolioData } from '@/lib/portfolio/types';

type SkillsProps = { data: PortfolioData['skills'] };

/**
 * Light instrument sheet (Phase 3). Server component: no framer, no WebGL, no
 * client state. The old tiers (Primary/Strong/Working), category columns and
 * legend were theatre, they carried no verifiable signal, so every skill name
 * is flattened into one deduped keyword strip in source order, with languages
 * as a single quiet mono line beneath it.
 */
export default function Skills({ data }: SkillsProps) {
  const skills = Array.from(
    new Set(
      data.groups.flatMap((group) => group.items.map((item) => item.name)),
    ),
  );

  const languages = data.languages
    .map((lang) => (lang.note ? `${lang.name} (${lang.note})` : lang.name))
    .join(' · ');

  return (
    <section
      id="skills"
      className="relative bg-panel px-5 py-24 text-carbon md:px-10 md:py-36"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-graphite">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          <span>{data.sectionLabel}</span>
        </div>

        <h2 className="max-w-3xl text-balance font-martian text-2xl font-bold leading-[1.2] text-carbon md:text-4xl">
          {data.titleLead}
          {data.titleEmphasis}
          {data.titleTail}
        </h2>

        <ul className="mt-12 flex flex-wrap gap-2">
          {skills.map((name) => (
            <li
              key={name}
              className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-graphite"
            >
              {name}
            </li>
          ))}
        </ul>

        <p className="mt-10 font-mono text-[11px] leading-relaxed text-graphite">
          {languages}
        </p>
      </div>
    </section>
  );
}
