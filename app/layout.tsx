import type { Metadata } from 'next';
import { Fraunces, JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import FirebaseAnalytics from './components/FirebaseAnalytics';
import { getPortfolioData } from '@/lib/portfolio/store';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

// Neutral sans for body copy.
const bodySans = Inter({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPortfolioData();
  const authorName = `${p.site.firstName} ${p.site.lastName}`.trim();
  return {
    title: p.seo.title,
    description: p.seo.description,
    keywords: p.seo.keywords,
    authors: [{ name: authorName || 'Portfolio' }],
    openGraph: {
      title: p.seo.title,
      description: p.seo.description,
      type: 'website',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jetbrains.variable} ${bodySans.variable}`}
    >
      <body className="bg-ink-deep text-bone antialiased">
        <FirebaseAnalytics />
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
