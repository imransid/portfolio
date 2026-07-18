// Parity-seed: write the on-disk defaults (tokens intact) to Firestore portfolio/main.
// Emit the JSON first with:  yarn dlx tsx scripts/emit-defaults.ts
// Then run:                  yarn node scripts/seed-firestore.mjs
import fs from 'node:fs';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const account = JSON.parse(fs.readFileSync('secrets/firebase.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(account) });
const doc = JSON.parse(fs.readFileSync('/tmp/pf-defaults.json', 'utf8'));
await getFirestore().collection('portfolio').doc('main').set(doc);
console.log('parity-seed: wrote', JSON.stringify(doc).length, 'bytes to portfolio/main (project ' + account.project_id + ')');
process.exit(0);
