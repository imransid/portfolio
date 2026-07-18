import type { PortfolioData, Project } from './types';

/**
 * The hero "production map" derived from the real project stacks.
 *
 * An edge exists iff a product's own `tech` array contains the technology, so
 * nothing renders that is not asserted by the data (REDLINE 1). Hub degree is a
 * COUNT you can audit against the cards, never a self-rating; the status tally
 * is computed here so the hero line can never drift from the pills (REDLINE 4).
 */

export type Hub = { tech: string; degree: number; products: string[] };

export type Tally = { total: number; live: number; inProduction: number };

export type Topology = {
  /** Spine: hubs with degree >= SPINE_MIN_DEGREE, highest degree first. */
  spine: Hub[];
  /** Every technology, for the flat keyword strip / progressive disclosure. */
  all: Hub[];
  tally: Tally;
};

export const SPINE_MIN_DEGREE = 3;

/**
 * Frontend frameworks are listed as chips on a card (they render straight from
 * project.tech) but are deliberately NOT backend map edges, so they never form a
 * topology hub. Everything else a product lists becomes an edge.
 */
const NON_EDGE_TECH = new Set(['Next.js']);

export function deriveTopology(projects: PortfolioData['projects']): Topology {
  const products: Project[] = [...projects.featured, ...projects.more];

  const byTech = new Map<string, string[]>();
  for (const p of products) {
    for (const tech of p.tech) {
      if (NON_EDGE_TECH.has(tech)) continue; // chip-only, not a backend edge
      const list = byTech.get(tech) ?? [];
      list.push(p.name);
      byTech.set(tech, list);
    }
  }

  const all: Hub[] = [...byTech.entries()]
    .map(([tech, prods]) => ({ tech, degree: prods.length, products: prods }))
    // highest degree first; ties broken alphabetically so the order is
    // deterministic and reproducible from the data, not hand-arranged.
    .sort((a, b) => b.degree - a.degree || a.tech.localeCompare(b.tech));

  const spine = all.filter((h) => h.degree >= SPINE_MIN_DEGREE);

  const tally: Tally = {
    total: products.length,
    live: products.filter((p) => p.status === 'Live').length,
    inProduction: products.filter((p) => p.status === 'In production').length,
  };

  return { spine, all, tally };
}
