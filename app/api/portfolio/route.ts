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
  await writePortfolioData(normalized);
  return NextResponse.json(normalized);
}
