import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from '@/lib/admin-session';
import {
  getFirebaseServiceAccountsConsoleUrl,
  getFirestoreCredentialHint,
  getFirestoreServer,
} from '@/lib/firestore-admin';
import {
  getPortfolioData,
  writeDefaultPortfolioToFirestore,
} from '@/lib/portfolio/store';

export const dynamic = 'force-dynamic';

type Body = { replaceDefaults?: boolean };

/**
 * Ensures `portfolio/main` exists in Firestore.
 * - Default: runs the same load path as the site (seeds empty / backfills incomplete docs).
 * - `{ "replaceDefaults": true }`: overwrites `main` with full bundled defaults (+ disk/legacy site merge).
 *
 * Requires a service account: `FIREBASE_SERVICE_ACCOUNT_KEY`, or
 * `FIREBASE_SERVICE_ACCOUNT_PATH` / `GOOGLE_APPLICATION_CREDENTIALS` pointing at the JSON file.
 */
export async function POST(request: Request) {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!getFirestoreServer()) {
    const diag = getFirestoreCredentialHint();
    let hint: string;
    if (diag.hasInlineKey) {
      hint =
        'FIREBASE_SERVICE_ACCOUNT_KEY is set but invalid. Remove that line and add your downloaded key as a file under secrets/ (any name ending in .json), then restart yarn dev.';
    } else if (diag.envPathMissing) {
      hint =
        'FIREBASE_SERVICE_ACCOUNT_PATH (or GOOGLE_APPLICATION_CREDENTIALS) points to a file that does not exist. Fix the path or drop the key JSON into the secrets/ folder instead.';
    } else if (diag.jsonFilesInSecrets.length > 0) {
      hint = `Found JSON in secrets/ (${diag.jsonFilesInSecrets.join(', ')}) but none is a valid Firebase service_account file. Re-download from Firebase → Project settings → Service accounts → Generate new private key.`;
    } else {
      hint =
        'No service account JSON on disk yet. Firebase Console → Project settings → Service accounts → Generate new private key → save the downloaded .json into this repo’s secrets/ folder (default long filename is fine). Restart yarn dev.';
    }

    return NextResponse.json(
      {
        error: 'Firestore Admin is not configured on this server.',
        hint,
        diagnostics: diag,
        setupUrl: getFirebaseServiceAccountsConsoleUrl(),
      },
      { status: 503 },
    );
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    /* empty body */
  }

  try {
    if (body.replaceDefaults) {
      const data = await writeDefaultPortfolioToFirestore();
      return NextResponse.json({
        ok: true,
        mode: 'replaceDefaults',
        message:
          'Wrote full default portfolio to Firestore (collection portfolio, document main).',
        firstName: data.site.firstName,
      });
    }

    const data = await getPortfolioData();
    return NextResponse.json({
      ok: true,
      mode: 'sync',
      message:
        'Firestore is in sync (empty/incomplete docs were filled from defaults). Open collection portfolio → document main.',
      firstName: data.site.firstName,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Seed failed', detail: message },
      { status: 500 },
    );
  }
}
