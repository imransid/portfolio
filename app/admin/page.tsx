import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from '@/lib/admin-session';
import AdminLoginForm from './login-form';

export const metadata = {
  title: 'Admin — Imran Khan',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (verifySessionToken(token)) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-glow/5 via-transparent to-transparent" />
      <AdminLoginForm />
    </div>
  );
}
