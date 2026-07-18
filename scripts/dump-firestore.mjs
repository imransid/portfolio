// Dump portfolio/main to a backup file and re-confirm what's in it.
import fs from 'node:fs';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const account = JSON.parse(fs.readFileSync('secrets/firebase.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(account) });
const snap = await getFirestore().collection('portfolio').doc('main').get();
if (!snap.exists) { console.log('portfolio/main does NOT exist'); process.exit(0); }

const d = snap.data();
fs.mkdirSync('backups', { recursive: true });
const path = 'backups/portfolio-main-2026-07-18.json';
fs.writeFileSync(path, JSON.stringify(d, null, 2));
console.log('dumped', JSON.stringify(d).length, 'bytes ->', path);

const projects = [...(d.projects?.featured || []), ...(d.projects?.more || [])];
console.log('project count:', projects.length);
console.log('names:', projects.map((p, i) => `${i + 1}.${p.name}`).join('  '));
const blob = JSON.stringify(d).toLowerCase();
console.log('Playzone anywhere in doc:', blob.includes('playzone'));
console.log('Go Smart anywhere in doc :', blob.includes('go smart'));
process.exit(0);
