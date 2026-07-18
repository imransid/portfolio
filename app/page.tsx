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

export const dynamic = 'force-dynamic';

export default async function Home() {
  const portfolio = interpolateForDisplay(await getPortfolioData());

  return (
    <main className="relative">
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
