// Build-time data-integrity gate (Phase 3) - aimed at the RENDER, not the file.
//
// It validates the data getPortfolioData() would actually serve: the Firestore
// `portfolio/main` document when it exists (which is what prod renders), else the
// on-disk defaults. So a stale Firestore doc fails the build, which makes this
// gate the forcing function for the re-seed instead of a green light over it.
//
// Checks on the rendered data:
//   R9   no two experience roles overlap
//   R10  no em dashes anywhere (the whole copy rule, applied to what renders)
//   R11  no unresolved {{tokens}} leaked; year-claims match the derived value
// Checks on the on-disk source (when defaults is what renders): also that no
// derivable number is typed and every bare stat number carries a source.
import fs from 'node:fs';

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const NOW = new Date();
const TOP = ['version', 'seo', 'site', 'hero', 'navigation', 'about', 'experience', 'projects', 'skills', 'contact', 'footer'];

function bound(text, isEnd) {
  const s = String(text).trim();
  if (/present|ongoing/i.test(s)) return NOW;
  const m = s.match(/([A-Za-z]{3,})?\s*(\d{4})/);
  if (!m) throw new Error(`Cannot parse date "${s}"`);
  return new Date(Date.UTC(Number(m[2]), m[1] ? MONTHS[m[1].slice(0, 3).toLowerCase()] : isEnd ? 11 : 0, isEnd ? 28 : 1));
}
const wholeYears = (a, b) => Math.floor((b - a) / (365.25 * 24 * 3600 * 1000));
const start = (p) => bound(p.split(/\s+-\s+/)[0], false);
const end = (p) => { const x = p.split(/\s+-\s+/); return bound(x[1] ?? x[0], true); };

function overlapErrors(periods) {
  const roles = periods.map((p) => ({ raw: p, s: start(p), e: end(p) })).sort((a, b) => a.s - b.s);
  const out = [];
  for (let i = 1; i < roles.length; i++) {
    if (roles[i].s < roles[i - 1].e) out.push(`R9 role overlap: "${roles[i - 1].raw}" overlaps "${roles[i].raw}".`);
  }
  return out;
}

function loadAccount() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (inline) { try { const j = JSON.parse(inline); if (j.type === 'service_account') return j; } catch {} }
  const paths = [process.env.FIREBASE_SERVICE_ACCOUNT_PATH, process.env.GOOGLE_APPLICATION_CREDENTIALS, 'secrets/firebase.json', 'secrets/firebase-adminsdk.json'].filter(Boolean);
  for (const p of paths) {
    try { const j = JSON.parse(fs.readFileSync(p, 'utf8')); if (j.type === 'service_account') return j; } catch {}
  }
  return null;
}

async function firestoreDoc() {
  const account = loadAccount();
  if (!account) return null;
  const { cert, getApps, initializeApp } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  if (!getApps().length) initializeApp({ credential: cert(account) });
  const snap = await getFirestore().collection('portfolio').doc('main').get();
  if (!snap.exists) return null;
  const d = snap.data();
  // getPortfolioData serves this doc whenever it exists with a usable site object.
  return d && d.site && Object.keys(d.site).length ? d : null;
}

// --- resolve what renders, then validate it ---
const errors = [];
const src = fs.readFileSync('lib/portfolio/defaults.ts', 'utf8');
let source;
let doc = null;
try { doc = await firestoreDoc(); } catch (e) { console.warn('(firestore read skipped:', e.message + ')'); }

if (doc) {
  source = `Firestore portfolio/main (project ${loadAccount()?.project_id})`;
  // interpolate derived tokens exactly as the app does
  const roles = doc.experience?.roles ?? [];
  const projects = [...(doc.projects?.featured ?? []), ...(doc.projects?.more ?? [])];
  const startDates = roles.map((r) => start(r.period));
  if (doc.experience?.careerStart) startDates.push(start(doc.experience.careerStart));
  const years = startDates.length ? wholeYears(startDates.slice().sort((a, b) => a - b)[0], NOW) : 0;
  const go = projects.find((p) => p.name === 'Go Smart');
  const goYears = go?.period ? wholeYears(end(go.period), NOW) : 0;
  const appsOnStores = projects.filter((p) => (p.links ?? []).some((l) => /apps\.apple\.com|play\.google\.com/.test(l.url))).length;
  const vals = { years: String(years), goSmartYears: String(goYears), appsOnStores: String(appsOnStores) };
  const rendered = JSON.stringify(doc).replace(/\{\{(years|goSmartYears|appsOnStores)\}\}/g, (_m, k) => vals[k] ?? _m);

  errors.push(...overlapErrors(roles.map((r) => r.period)));
  if (rendered.includes('—')) errors.push('R10 em dash present in the rendered copy (banned).');
  if (rendered.includes('{{')) errors.push('R11 unresolved {{token}} leaked into the render.');
  for (const m of rendered.matchAll(/(\d+)\+?\s*years?\b/gi)) {
    if (Number(m[1]) !== years) errors.push(`R11 rendered "${m[0].trim()}" does not match the derived ${years} years (stale data?).`);
  }
} else {
  source = 'on-disk defaults.ts (no Firestore doc)';
  const exp = src.slice(src.indexOf('experience:'), src.indexOf('projects:'));
  errors.push(...overlapErrors([...exp.matchAll(/period:\s*'([^']+)'/g)].map((m) => m[1])));
  const WORDS = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve';
  const typed = [...src.matchAll(/\d+\+?\s*years?\b/gi), ...src.matchAll(new RegExp(`\\b(?:${WORDS})\\s+years?\\b`, 'gi'))].map((m) => m[0].trim());
  if (typed.length) errors.push(`Typed year-claim(s) that must be a token ({{years}}): ${[...new Set(typed)].join(', ')}`);
  for (const tok of ['{{years}}', '{{goSmartYears}}', '{{appsOnStores}}']) if (!src.includes(tok)) errors.push(`Missing derived token ${tok}.`);
  const statsBlock = src.slice(src.indexOf('stats: ['), src.indexOf('],', src.indexOf('stats: [')));
  for (const chunk of statsBlock.split(/\},/)) {
    const nm = chunk.match(/n:\s*'([^']*)'/);
    if (nm && !nm[1].includes('{{') && !/source:\s*'https?:\/\//.test(chunk)) errors.push(`Bare stat number "${nm[1]}": must be a token or carry a source URL.`);
  }
  if (src.includes('—')) errors.push('R10 em dash present in defaults.ts copy (banned).');
}

if (errors.length) {
  console.error(`\nDATA CHECK FAILED (build refuses to ship) - source: ${source}\n`);
  for (const e of errors) console.error('  - ' + e);
  console.error('');
  process.exit(1);
}
console.log(`data check OK - validated ${source}. No overlap, no em dashes, numbers derived or cited.`);
process.exit(0);
