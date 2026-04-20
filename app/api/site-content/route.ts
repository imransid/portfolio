import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from '@/lib/admin-session';
import {
  getSiteContent,
  writeSiteContent,
  type SiteContent,
} from '@/lib/site-content';

export const dynamic = 'force-dynamic';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parseSiteContent(body: unknown): SiteContent | null {
  if (!isRecord(body)) return null;
  const strings = [
    'roleTagline',
    'firstName',
    'lastName',
    'bio',
    'location',
    'experienceMeta',
    'experienceFocus',
  ] as const;
  const out: Partial<SiteContent> = {};
  for (const key of strings) {
    const val = body[key];
    if (typeof val !== 'string') return null;
    out[key] = val.trim();
  }
  return out as SiteContent;
}

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
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

  const parsed = parseSiteContent(body);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await writeSiteContent(parsed);
  return NextResponse.json(parsed);
}
