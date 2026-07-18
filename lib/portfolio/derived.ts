import type { ExperienceRole, PortfolioData } from './types';

/**
 * Derived numbers (Phase 3). Nothing numeric is typed into the copy: the copy
 * carries tokens ({{years}}, {{goSmartYears}}) and these functions compute the
 * real values from dates in the data at DISPLAY time, so a number can never
 * drift from what the dates support. Stored data keeps the tokens.
 */

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function bound(text: string, isEnd: boolean, now: Date): Date {
  const s = text.trim();
  if (/present|ongoing/i.test(s)) return now;
  const m = s.match(/([A-Za-z]{3,})?\s*(\d{4})/);
  if (!m) return now;
  const year = Number(m[2]);
  const month = m[1] ? MONTHS[m[1].slice(0, 3).toLowerCase()] ?? (isEnd ? 11 : 0) : isEnd ? 11 : 0;
  return new Date(Date.UTC(year, month, isEnd ? 28 : 1));
}

function periodStart(period: string, now: Date): Date {
  return bound(period.split(/\s+-\s+/)[0] ?? '', false, now);
}

function periodEnd(period: string, now: Date): Date {
  const parts = period.split(/\s+-\s+/);
  return bound(parts[1] ?? parts[0] ?? '', true, now);
}

function wholeYears(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / (365.25 * 24 * 3600 * 1000)));
}

/**
 * Years from the earliest start to now (floored, never rounded up). The earliest
 * is the min of an optional careerStart anchor and every role start, so real
 * professional experience before the first listed role still counts.
 */
export function deriveExperienceYears(
  roles: ExperienceRole[],
  now: Date,
  careerStart?: string,
): number {
  const starts = roles.map((r) => periodStart(r.period, now));
  if (careerStart && careerStart.trim()) starts.push(bound(careerStart, false, now));
  if (!starts.length) return 0;
  let earliest = starts[0];
  for (const s of starts) if (s < earliest) earliest = s;
  return wholeYears(earliest, now);
}

/** Years since the Go Smart engagement ended (its period end date), floored. */
export function deriveGoSmartYears(projects: PortfolioData['projects'], now: Date): number {
  const go = [...projects.featured, ...projects.more].find((p) => p.name === 'Go Smart');
  if (!go?.period) return 0;
  return wholeYears(periodEnd(go.period, now), now);
}

const STORE_URL = /apps\.apple\.com|play\.google\.com/;

/** Count of products carrying at least one public app-store link. */
export function deriveAppsOnStores(projects: PortfolioData['projects']): number {
  return [...projects.featured, ...projects.more].filter((p) =>
    p.links.some((l) => STORE_URL.test(l.url)),
  ).length;
}

function deepReplaceStrings<T>(value: T, fn: (s: string) => string): T {
  if (typeof value === 'string') return fn(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => deepReplaceStrings(v, fn)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepReplaceStrings(v, fn);
    return out as T;
  }
  return value;
}

/**
 * Replace derived tokens for DISPLAY only. Call at each render boundary (page,
 * metadata, CV); getPortfolioData keeps the tokens so an admin save can never
 * bake a stale number into storage.
 */
export function interpolateForDisplay(data: PortfolioData, now: Date = new Date()): PortfolioData {
  const values: Record<string, string> = {
    years: String(deriveExperienceYears(data.experience.roles, now, data.experience.careerStart)),
    goSmartYears: String(deriveGoSmartYears(data.projects, now)),
    appsOnStores: String(deriveAppsOnStores(data.projects)),
  };
  return deepReplaceStrings(data, (s) =>
    s.replace(/\{\{(years|goSmartYears|appsOnStores)\}\}/g, (_m, key: string) => values[key] ?? _m),
  );
}
