import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from '@/lib/admin-session';
import {
  getPortfolioData,
  normalizePortfolioData,
  writePortfolioData,
} from '@/lib/portfolio/store';

export const dynamic = 'force-dynamic';
/** Firebase Admin requires Node; avoids any accidental Edge bundle. */
export const runtime = 'nodejs';

export async function GET() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await getPortfolioData();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const normalized = normalizePortfolioData(body);
  try {
    const persistedTo = await writePortfolioData(normalized);
    const res = NextResponse.json(normalized);
    res.headers.set('X-Portfolio-Persisted-To', persistedTo);
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Save failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
