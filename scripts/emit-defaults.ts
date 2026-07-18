// One-shot: serialize the on-disk defaults (tokens intact) for the parity-seed.
import fs from 'node:fs';
import { defaultPortfolioData } from '../lib/portfolio/defaults';

const json = JSON.stringify(defaultPortfolioData);
fs.writeFileSync('/tmp/pf-defaults.json', json);
console.log('emitted defaults:', json.length, 'bytes ->', '/tmp/pf-defaults.json');
