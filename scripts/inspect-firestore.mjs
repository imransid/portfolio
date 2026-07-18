// Read-only diagnostic: what does portfolio/main actually contain?
import fs from 'node:fs';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const account = JSON.parse(fs.readFileSync('secrets/firebase.json', 'utf8'));
console.log('service account project:', account.project_id);
if (!getApps().length) initializeApp({ credential: cert(account) });
const db = getFirestore();

const snap = await db.collection('portfolio').doc('main').get();
console.log('portfolio/main exists:', snap.exists);
if (!snap.exists) process.exit(0);

const d = snap.data();
const TOP = ['version', 'seo', 'site', 'hero', 'navigation', 'about', 'experience', 'projects', 'skills', 'contact', 'footer'];
const missing = TOP.filter((k) => d[k] === undefined);
console.log('structurally complete:', missing.length === 0, missing.length ? `(missing: ${missing})` : '');
console.log('--- staleness probes (Firestore is what renders in prod) ---');
console.log('experience role periods :', (d.experience?.roles || []).map((r) => r.period).join('  |  '));
console.log('about.stats n           :', (d.about?.stats || []).map((s) => s.n).join('  |  '));
const projects = [...(d.projects?.featured || []), ...(d.projects?.more || [])];
console.log('project names           :', projects.map((p) => p.name).join(', '));
console.log('has "Go Smart"          :', projects.some((p) => p.name === 'Go Smart'));
const bz = projects.find((p) => /bazzile/i.test(p.name || ''));
console.log('Bazzile category        :', bz?.category);
console.log('projects have status    :', (d.projects?.featured || []).some((p) => typeof p.status === 'string' && p.status));
console.log('projects.archiveLine    :', d.projects?.archiveLine ?? '(absent)');
console.log('contains {{tokens}}     :', JSON.stringify(d).includes('{{'));
console.log('seo.description         :', (d.seo?.description || '').slice(0, 80));
process.exit(0);
