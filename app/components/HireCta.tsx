type HireCtaProps = { upworkUrl: string };

/**
 * Closing call to action for /hire. One action only, hire on Upwork, echoing the
 * nav CTA so the action is present both top and bottom. No contact channels here
 * by design: the page must not help a client leave the Upwork platform.
 */
export default function HireCta({ upworkUrl }: HireCtaProps) {
  return (
    <section className="relative bg-sheet px-5 py-24 text-carbon md:px-10 md:py-36">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-graphite">
          <span className="h-px w-8 bg-line" aria-hidden="true" />
          <span>Work with me</span>
        </div>

        <h2 className="max-w-[22ch] text-balance font-martian text-2xl font-bold leading-[1.2] text-carbon md:text-4xl">
          Need this built? Let&rsquo;s do it on Upwork.
        </h2>

        <p className="mt-10 max-w-[60ch] font-sans text-[15px] leading-relaxed text-carbon/80">
          Everything above is verifiable: live apps, store listings and public
          sources. Start the contract on Upwork and the scope, the milestones and
          the proof are already on the table.
        </p>

        <div className="mt-10 flex flex-col items-start gap-4">
          <a
            href={upworkUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-carbon px-5 py-3 font-martian text-[13px] font-medium uppercase tracking-[0.06em] text-sheet transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-carbon"
          >
            Hire me on Upwork &rarr;
          </a>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-graphite">
            Message me through Upwork.
          </p>
        </div>
      </div>
    </section>
  );
}
