/**
 * Hero slice of portfolio data. Full document lives in `lib/portfolio`.
 */
export type { SiteContent } from '@/lib/portfolio/types';
export { siteContentDefaults } from '@/lib/portfolio/defaults';
import { getPortfolioData, writePortfolioData } from '@/lib/portfolio/store';
import type { SiteContent } from '@/lib/portfolio/types';

export async function getSiteContent(): Promise<SiteContent> {
  const p = await getPortfolioData();
  return p.site;
}

export async function writeSiteContent(content: SiteContent): Promise<void> {
  const p = await getPortfolioData();
  p.site = content;
  await writePortfolioData(p);
}
