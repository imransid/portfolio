import { Suspense } from 'react';
import { getFirestoreServer } from '@/lib/firestore-admin';
import { getPortfolioData } from '@/lib/portfolio/store';
import PortfolioDashboard from './portfolio-dashboard';

export const metadata = {
  title: 'Admin — Studio',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const initial = await getPortfolioData();
  const firestoreConfigured = getFirestoreServer() !== null;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink-deep flex items-center justify-center text-bone-muted text-sm">
          Loading editor…
        </div>
      }
    >
      <PortfolioDashboard initial={initial} firestoreConfigured={firestoreConfigured} />
    </Suspense>
  );
}
