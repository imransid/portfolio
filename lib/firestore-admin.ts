import fs from 'fs';
import path from 'path';
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/** Only set after a successful Firestore connection (failed lookups are retried). */
let firestoreDb: Firestore | undefined;

let loggedMissingCredentials = false;

function devWarn(message: string) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[firestore-admin] ${message}`);
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function looksLikeServiceAccount(v: unknown): v is ServiceAccount {
  if (!isRecord(v)) return false;
  return (
    v.type === 'service_account' &&
    typeof v.private_key === 'string' &&
    typeof v.client_email === 'string'
  );
}

function tryParseJsonFile(
  absPath: string,
  options?: { quiet?: boolean },
): ServiceAccount | null {
  try {
    const raw = fs.readFileSync(absPath, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (!looksLikeServiceAccount(parsed)) {
      if (!options?.quiet) {
        devWarn(`File ${absPath} is not a valid Firebase service account JSON.`);
      }
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * If these files exist (no env needed), they are used in order.
 * Matches the path suggested in the admin dashboard (`secrets/firebase.json`).
 */
const IMPLICIT_ACCOUNT_FILES = [
  'secrets/firebase.json',
  'secrets/firebase-adminsdk.json',
];

/** Any `*.json` in `secrets/` after fixed names (matches Firebase download names). */
function tryLoadAnyJsonInSecretsDir(cwd: string): ServiceAccount | null {
  const secretsDir = path.join(cwd, 'secrets');
  if (!fs.existsSync(secretsDir) || !fs.statSync(secretsDir).isDirectory()) {
    return null;
  }
  let names: string[];
  try {
    names = fs.readdirSync(secretsDir);
  } catch {
    return null;
  }
  const jsonFiles = names.filter((n) => n.endsWith('.json'));
  for (const name of jsonFiles) {
    const abs = path.join(secretsDir, name);
    const account = tryParseJsonFile(abs, { quiet: true });
    if (account) {
      if (process.env.NODE_ENV === 'development') {
        console.info(`[firestore-admin] Using service account file: secrets/${name}`);
      }
      return account;
    }
  }
  return null;
}

/**
 * Loads service account JSON from, in order:
 * 1. `FIREBASE_SERVICE_ACCOUNT_KEY` — full JSON as one line
 * 2. `FIREBASE_SERVICE_ACCOUNT_PATH` — path to the downloaded `.json` file
 * 3. `GOOGLE_APPLICATION_CREDENTIALS` — path to the JSON file
 * 4. First existing file among `secrets/firebase.json`, `secrets/firebase-adminsdk.json`
 */
function loadServiceAccount(): ServiceAccount | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (inline) {
    try {
      const parsed = JSON.parse(inline) as unknown;
      if (looksLikeServiceAccount(parsed)) return parsed;
      devWarn(
        'FIREBASE_SERVICE_ACCOUNT_KEY parsed but is not a service_account JSON.',
      );
      return null;
    } catch {
      devWarn(
        'Could not parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON. Use a file path instead (FIREBASE_SERVICE_ACCOUNT_PATH).',
      );
      return null;
    }
  }

  const cwd = process.cwd();
  const fromEnv =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();

  const candidates: string[] = [];

  if (fromEnv) {
    candidates.push(
      path.isAbsolute(fromEnv) ? fromEnv : path.resolve(cwd, fromEnv),
    );
  }

  for (const rel of IMPLICIT_ACCOUNT_FILES) {
    candidates.push(path.resolve(cwd, rel));
  }

  const tried = new Set<string>();
  for (const abs of candidates) {
    if (tried.has(abs)) continue;
    tried.add(abs);
    if (!fs.existsSync(abs)) continue;
    const account = tryParseJsonFile(abs, { quiet: false });
    if (account) {
      if (process.env.NODE_ENV === 'development' && !fromEnv) {
        console.info(
          `[firestore-admin] Using service account file: ${path.relative(cwd, abs) || abs}`,
        );
      }
      return account;
    }
  }

  const fromDir = tryLoadAnyJsonInSecretsDir(cwd);
  if (fromDir) return fromDir;

  if (process.env.NODE_ENV === 'development' && !loggedMissingCredentials) {
    loggedMissingCredentials = true;
    const checked = [...tried].join(', ') || '(no paths)';
    devWarn(
      `No Firebase Admin credentials found. Checked: ${checked}, then any secrets/*.json. Download a key from Firebase → Service accounts → Generate new private key, save the .json file inside the secrets/ folder (any name), restart yarn dev.`,
    );
  }

  return null;
}

export type FirestoreCredentialHint = {
  hasInlineKey: boolean;
  envPathSet: boolean;
  envPathMissing: boolean;
  pathsChecked: { absolute: string; exists: boolean }[];
  secretsDirExists: boolean;
  jsonFilesInSecrets: string[];
};

/** For API responses — no secret values, only paths and booleans. */
export function getFirestoreCredentialHint(): FirestoreCredentialHint {
  const cwd = process.cwd();
  const pathsChecked: { absolute: string; exists: boolean }[] = [];
  const push = (abs: string) => {
    if (pathsChecked.some((p) => p.absolute === abs)) return;
    pathsChecked.push({ absolute: abs, exists: fs.existsSync(abs) });
  };

  const fromEnv =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  const envResolved = fromEnv
    ? path.isAbsolute(fromEnv)
      ? fromEnv
      : path.resolve(cwd, fromEnv)
    : null;
  if (envResolved) push(envResolved);
  for (const rel of IMPLICIT_ACCOUNT_FILES) {
    push(path.resolve(cwd, rel));
  }

  const secretsDir = path.join(cwd, 'secrets');
  const secretsDirExists =
    fs.existsSync(secretsDir) && fs.statSync(secretsDir).isDirectory();
  let jsonFilesInSecrets: string[] = [];
  if (secretsDirExists) {
    try {
      jsonFilesInSecrets = fs
        .readdirSync(secretsDir)
        .filter((n) => n.endsWith('.json'));
    } catch {
      jsonFilesInSecrets = [];
    }
  }

  const envPathSet = Boolean(fromEnv);
  const envPathMissing = Boolean(
    envResolved && !pathsChecked.find((p) => p.absolute === envResolved)?.exists,
  );

  return {
    hasInlineKey: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim()),
    envPathSet,
    envPathMissing,
    pathsChecked,
    secretsDirExists,
    jsonFilesInSecrets,
  };
}

export function getFirebaseServiceAccountsConsoleUrl(): string {
  const id =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    'mine-a6dd0';
  return `https://console.firebase.google.com/project/${id}/settings/serviceaccounts/adminsdk`;
}

/**
 * Returns Firestore when a service account JSON is available (env or secrets/*.json).
 * Otherwise returns null and the app falls back to local JSON under `data/`.
 */
export function getFirestoreServer(): Firestore | null {
  if (firestoreDb !== undefined) {
    return firestoreDb;
  }

  const account = loadServiceAccount();
  if (!account) {
    return null;
  }

  try {
    let app: App;
    if (getApps().length > 0) {
      app = getApps()[0]!;
    } else {
      app = initializeApp({ credential: cert(account) });
    }
    firestoreDb = getFirestore(app);
    return firestoreDb;
  } catch (e) {
    devWarn(
      `Firebase Admin init failed: ${e instanceof Error ? e.message : String(e)}`,
    );
    return null;
  }
}
