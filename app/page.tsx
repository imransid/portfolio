import Navigation from './components/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Experience from './sections/Experience';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Contact from './sections/Contact';
import Footer from './components/Footer';
import { getPortfolioData } from '@/lib/portfolio/store';
import { interpolateForDisplay } from '@/lib/portfolio/derived';

// ISR, not a pure static prerender. A fully static page is edge-cached with no
// revalidate trigger, so stale HTML sticks on any POP until a redeploy purge -
// and that purge is unreliable across edges (some serve new, some serve old).
// A time-based revalidate is a trigger that actually fires: every node re-checks
// origin on its own timer, independent of purge. Still edge-cached, so LCP holds.
export const revalidate = 60;

export default async function Home() {
  const portfolio = interpolateForDisplay(await getPortfolioData());

  return (
    <main className="relative min-h-screen bg-sheet">
      <Navigation data={portfolio.navigation} />
      <Hero site={portfolio.site} hero={portfolio.hero} projects={portfolio.projects} />
      <About data={portfolio.about} />
      <Experience data={portfolio.experience} />
      <Projects data={portfolio.projects} />
      <Skills data={portfolio.skills} />
      <Contact data={portfolio.contact} />
      <Footer data={portfolio.footer} />
    </main>
  );
}
