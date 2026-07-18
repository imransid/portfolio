import type { Metadata } from 'next';
import HireNav from '../components/HireNav';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Experience from '../sections/Experience';
import Projects from '../sections/Projects';
import Skills from '../sections/Skills';
import HireCta from '../components/HireCta';
import HireFooter from '../components/HireFooter';
import { getPortfolioData } from '@/lib/portfolio/store';
import { interpolateForDisplay } from '@/lib/portfolio/derived';

// Same revalidate as / so the hire route can never get stuck stale on one edge.
export const revalidate = 60;

// Upwork ToS: the hire page must not help a client leave the platform, so it
// carries zero contact info and the single action is the Upwork profile.
const UPWORK_URL = 'https://www.upwork.com/freelancers/~01bfd433e5d8038709';

export const metadata: Metadata = {
  title: 'Hire Imran Khan on Upwork',
  description: 'The same proof, one action: hire me through Upwork.',
  robots: { index: false, follow: false },
};

/**
 * /hire - the Upwork landing route. Reuses the exact proof sections from the home
 * page (production map, experience, project case studies, stack) but swaps the
 * contact-bearing nav, contact section and footer for a single Upwork CTA, top
 * and bottom. No mailto, tel, linkedin, CV download or contact form anywhere.
 */
export default async function Hire() {
  const portfolio = interpolateForDisplay(await getPortfolioData());

  return (
    <main className="relative min-h-screen bg-sheet">
      <HireNav data={portfolio.navigation} upworkUrl={UPWORK_URL} />
      <Hero site={portfolio.site} hero={portfolio.hero} projects={portfolio.projects} />
      {/* /hire is the Upwork-ToS-safe page: zero off-platform contact. The Bolt
          Fusion affiliation links to an agency site with a Calendly/mailto/socials,
          a one-hop path off-platform, so it is stripped here and kept on / only. */}
      <About data={{ ...portfolio.about, affiliation: undefined }} />
      <Experience data={portfolio.experience} />
      <Projects data={portfolio.projects} />
      <Skills data={portfolio.skills} />
      <HireCta upworkUrl={UPWORK_URL} />
      <HireFooter data={portfolio.footer} upworkUrl={UPWORK_URL} />
    </main>
  );
}
