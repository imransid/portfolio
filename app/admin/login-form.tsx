'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || 'Sign in failed');
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-bone/15 bg-ink-deep/80 p-8 shadow-2xl backdrop-blur-md"
    >
      <div>
        <h1 className="font-display text-2xl text-bone">Admin</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-bone-muted">
          Portfolio dashboard
        </p>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-bone-muted">
            Email
          </span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-bone/20 bg-ink-deep px-4 py-3 text-sm text-bone outline-none ring-amber-glow/30 transition focus:border-amber-glow/50 focus:ring-2"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-bone-muted">
            Password
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-bone/20 bg-ink-deep px-4 py-3 text-sm text-bone outline-none ring-amber-glow/30 transition focus:border-amber-glow/50 focus:ring-2"
            required
          />
        </label>
      </div>

      {error ? (
        <p className="font-mono text-xs text-red-400/90" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-amber-glow px-6 py-3.5 text-sm font-medium text-ink-deep transition hover:bg-bone disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
