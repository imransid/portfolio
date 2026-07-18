import fs from 'fs';
import path from 'path';
import { getFirestoreServer } from '@/lib/firestore-admin';
import { defaultPortfolioData } from './defaults';
import type {
  ContactChannel,
  ContactChannelIcon,
  ExperienceRole,
  LanguageLine,
  NavItem,
  PortfolioData,
  Project,
  ProjectLink,
  SiteContent,
  SkillGroup,
  SkillItem,
  SkillLevel,
  Stat,
} from './types';

const PORTFOLIO_PATH = path.join(process.cwd(), 'data', 'portfolio.json');
const LEGACY_SITE_PATH = path.join(process.cwd(), 'data', 'site-content.json');
const FIRESTORE_COLLECTION = 'portfolio';
const FIRESTORE_DOC_MAIN = 'main';
const FIRESTORE_DOC_LEGACY_SITE = 'siteContent';

/** Where `writePortfolioData` actually wrote the document. */
export type PortfolioPersistTarget = 'firestore' | 'local';

/** Every key we expect on `portfolio/main` for a complete portfolio payload. */
const TOP_LEVEL_PORTFOLIO_KEYS: (keyof PortfolioData)[] = [
  'version',
  'seo',
  'site',
  'hero',
  'navigation',
  'about',
  'experience',
  'projects',
  'skills',
  'contact',
  'footer',
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback;
}

/** Optional https URL: empty allowed; invalid or non-https rejected to empty. */
function normalizeHttpsPortfolioUrl(v: unknown, fallbackWhenMissing: string): string {
  if (typeof v !== 'string') return fallbackWhenMissing;
  const s = v.trim();
  if (!s) return '';
  if (!s.startsWith('https://')) return '';
  try {
    const u = new URL(s);
    return u.href;
  } catch {
    return '';
  }
}

function strArr(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  const out = v.filter((x): x is string => typeof x === 'string');
  return out.length ? out : fallback;
}

function normalizeSiteContent(raw: unknown, def: SiteContent): SiteContent {
  if (!isRecord(raw)) return { ...def };
  const keys: (keyof SiteContent)[] = [
    'roleTagline',
    'firstName',
    'lastName',
    'bio',
    'location',
    'experienceMeta',
    'experienceFocus',
  ];
  const out = { ...def };
  for (const k of keys) {
    if (typeof raw[k] === 'string') out[k] = (raw[k] as string).trim();
  }
  return out;
}

function normalizeNavItems(raw: unknown, def: NavItem[]): NavItem[] {
  if (!Array.isArray(raw)) return def;
  const out: NavItem[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    const label = str(it.label, '');
    const href = str(it.href, '');
    const num = str(it.num, '');
    if (label && href) out.push({ label, href, num });
  }
  return out.length ? out : def;
}

function normalizeStats(raw: unknown, def: Stat[]): Stat[] {
  if (!Array.isArray(raw)) return def;
  const out: Stat[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    const n = str(it.n, '');
    const label = str(it.label, '');
    const source = str(it.source, '');
    if (n && label) out.push(source ? { n, label, source } : { n, label });
  }
  return out.length ? out : def;
}

function normalizeProjectLinks(raw: unknown): ProjectLink[] {
  if (!Array.isArray(raw)) return [];
  const out: ProjectLink[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    const label = str(it.label, '');
    const url = str(it.url, '') || str(it.href, '');
    if (label && url) out.push({ label, url });
  }
  return out;
}

/** Admin / Firestore may store tech as string[] or a single comma-separated string. */
function normalizeProjectTech(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Prefer own `tech`; if the key is absent, accept `techStack` (common in hand-written JSON).
 * Uses `hasOwnProperty` so we do not read inherited `tech` and ignore an explicit `tech: []`.
 */
function normalizeProjectTechFromRecord(it: Record<string, unknown>): string[] {
  if (!Object.prototype.hasOwnProperty.call(it, 'tech')) {
    return normalizeProjectTech(it.techStack);
  }
  return normalizeProjectTech(it.tech);
}

function projectBadgeNumber(
  raw: unknown,
  fallbackIndex1Based: number,
): string {
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t) return t;
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const n = Math.trunc(raw);
    if (n >= 0 && n <= 99) return String(n).padStart(2, '0');
  }
  return String(fallbackIndex1Based).padStart(2, '0');
}

function projectNameFromUnknown(it: Record<string, unknown>): string {
  const n = it.name;
  if (typeof n === 'string') return n;
  if (typeof n === 'number' && Number.isFinite(n)) return String(n);
  return '';
}

function normalizeProjects(raw: unknown, def: Project[]): Project[] {
  if (!Array.isArray(raw)) return def;
  const out: Project[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    if (Object.keys(it).length === 0) continue;
    const name = projectNameFromUnknown(it);
    const number = projectBadgeNumber(it.number, out.length + 1);
    out.push({
      name,
      tagline: str(it.tagline, ''),
      description: str(it.description, ''),
      period: str(it.period, ''),
      category: str(it.category, ''),
      tech: normalizeProjectTechFromRecord(it),
      links: normalizeProjectLinks(it.links),
      accent: str(it.accent, ''),
      number,
      status: str(it.status, ''),
    });
  }
  return out.length ? out : def;
}

function normalizeSkillLevel(v: unknown): SkillLevel | null {
  if (v === 'Primary' || v === 'Strong' || v === 'Working') return v;
  return null;
}

function normalizeSkillItems(raw: unknown, def: SkillItem[]): SkillItem[] {
  if (!Array.isArray(raw)) return def;
  const out: SkillItem[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    const name = str(it.name, '');
    const level = normalizeSkillLevel(it.level);
    if (name && level) out.push({ name, level });
  }
  return out.length ? out : def;
}

function normalizeSkillGroups(raw: unknown, def: SkillGroup[]): SkillGroup[] {
  if (!Array.isArray(raw)) return def;
  const out: SkillGroup[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    const label = str(it.label, '');
    const heading = str(it.heading, '');
    const items = normalizeSkillItems(it.items, []);
    if (label && heading && items.length)
      out.push({ label, heading, items });
  }
  return out.length ? out : def;
}

function normalizeLanguages(raw: unknown, def: LanguageLine[]): LanguageLine[] {
  if (!Array.isArray(raw)) return def;
  const out: LanguageLine[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    const name = str(it.name, '');
    const note = str(it.note, '');
    if (name) out.push({ name, note });
  }
  return out.length ? out : def;
}

const ICONS: ContactChannelIcon[] = [
  'mail',
  'phone',
  'linkedin',
  'github',
  'map',
];

function normalizeContactIcon(v: unknown): ContactChannelIcon {
  if (typeof v === 'string' && ICONS.includes(v as ContactChannelIcon))
    return v as ContactChannelIcon;
  return 'mail';
}

function normalizeChannels(raw: unknown, def: ContactChannel[]): ContactChannel[] {
  if (!Array.isArray(raw)) return def;
  const out: ContactChannel[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    const label = str(it.label, '');
    const value = str(it.value, '');
    const href = str(it.href, '');
    if (label && href) out.push({ label, value, href, icon: normalizeContactIcon(it.icon) });
  }
  return out.length ? out : def;
}

function normalizeRoles(raw: unknown, def: ExperienceRole[]): ExperienceRole[] {
  if (!Array.isArray(raw)) return def;
  const out: ExperienceRole[] = [];
  for (const it of raw) {
    if (!isRecord(it)) continue;
    const company = str(it.company, '');
    const title = str(it.title, '');
    const period = str(it.period, '');
    const years = str(it.years, '');
    const bullets = strArr(it.bullets, []);
    const tech = strArr(it.tech, []);
    if (company && title) out.push({ company, title, period, years, bullets, tech });
  }
  return out.length ? out : def;
}

export function normalizePortfolioData(input: unknown): PortfolioData {
  const d = defaultPortfolioData;
  if (!isRecord(input)) return structuredClone(d);

  const seo = isRecord(input.seo) ? input.seo : {};
  const hero = isRecord(input.hero) ? input.hero : {};
  const navigation = isRecord(input.navigation) ? input.navigation : {};
  const about = isRecord(input.about) ? input.about : {};
  const experience = isRecord(input.experience) ? input.experience : {};
  const projects = isRecord(input.projects) ? input.projects : {};
  const skills = isRecord(input.skills) ? input.skills : {};
  const contact = isRecord(input.contact) ? input.contact : {};
  const footer = isRecord(input.footer) ? input.footer : {};

  return {
    version: 1,
    seo: {
      title: str(seo.title, d.seo.title),
      description: str(seo.description, d.seo.description),
      keywords: strArr(seo.keywords, d.seo.keywords),
    },
    site: normalizeSiteContent(input.site, d.site),
    hero: {
      portfolioLine: str(hero.portfolioLine, d.hero.portfolioLine),
      headline: str(hero.headline, d.hero.headline),
      marqueeSkills: strArr(hero.marqueeSkills, d.hero.marqueeSkills),
      ctaPrimaryLabel: str(hero.ctaPrimaryLabel, d.hero.ctaPrimaryLabel),
      ctaPrimaryHref: str(hero.ctaPrimaryHref, d.hero.ctaPrimaryHref),
      ctaSecondaryLabel: str(hero.ctaSecondaryLabel, d.hero.ctaSecondaryLabel),
      ctaSecondaryHref: str(hero.ctaSecondaryHref, d.hero.ctaSecondaryHref),
    },
    navigation: {
      brandMonogram: str(navigation.brandMonogram, d.navigation.brandMonogram),
      brandName: str(navigation.brandName, d.navigation.brandName),
      availabilityLabel: str(
        navigation.availabilityLabel,
        d.navigation.availabilityLabel,
      ),
      timezoneCity: str(navigation.timezoneCity, d.navigation.timezoneCity),
      timeZone: str(navigation.timeZone, d.navigation.timeZone),
      navItems: normalizeNavItems(navigation.navItems, d.navigation.navItems),
    },
    about: {
      sectionNum: str(about.sectionNum, d.about.sectionNum),
      sectionLabel: str(about.sectionLabel, d.about.sectionLabel),
      manifestoKicker: str(about.manifestoKicker, d.about.manifestoKicker),
      manifestoBody: str(about.manifestoBody, d.about.manifestoBody),
      headlineLine1Before: str(
        about.headlineLine1Before,
        d.about.headlineLine1Before,
      ),
      headlineLine1Highlight: str(
        about.headlineLine1Highlight,
        d.about.headlineLine1Highlight,
      ),
      headlineLine2: str(about.headlineLine2, d.about.headlineLine2),
      headlineLine3Italic: str(
        about.headlineLine3Italic,
        d.about.headlineLine3Italic,
      ),
      bodyParagraphs: strArr(about.bodyParagraphs, d.about.bodyParagraphs),
      stats: normalizeStats(about.stats, d.about.stats),
      affiliation: isRecord(about.affiliation)
        ? {
            lead: str(about.affiliation.lead, d.about.affiliation?.lead ?? ''),
            linkLabel: str(about.affiliation.linkLabel, d.about.affiliation?.linkLabel ?? ''),
            linkUrl: str(about.affiliation.linkUrl, d.about.affiliation?.linkUrl ?? ''),
            tail: str(about.affiliation.tail, d.about.affiliation?.tail ?? ''),
          }
        : d.about.affiliation,
    },
    experience: {
      sectionNum: str(experience.sectionNum, d.experience.sectionNum),
      sectionLabel: str(experience.sectionLabel, d.experience.sectionLabel),
      titleLead: str(experience.titleLead, d.experience.titleLead),
      titleEmphasis: str(experience.titleEmphasis, d.experience.titleEmphasis),
      titleTail: str(experience.titleTail, d.experience.titleTail),
      roles: normalizeRoles(experience.roles, d.experience.roles),
    },
    projects: {
      sectionNum: str(projects.sectionNum, d.projects.sectionNum),
      sectionLabel: str(projects.sectionLabel, d.projects.sectionLabel),
      titleLead: str(projects.titleLead, d.projects.titleLead),
      titleEmphasis: str(projects.titleEmphasis, d.projects.titleEmphasis),
      titleMid: str(projects.titleMid, d.projects.titleMid),
      titleTailItalic: str(
        projects.titleTailItalic,
        d.projects.titleTailItalic,
      ),
      aside: str(projects.aside, d.projects.aside),
      featured: normalizeProjects(projects.featured, d.projects.featured),
      more: normalizeProjects(projects.more, d.projects.more),
      archiveLine: str(projects.archiveLine, d.projects.archiveLine),
      moreSectionTitleBefore: str(
        projects.moreSectionTitleBefore,
        d.projects.moreSectionTitleBefore,
      ),
      moreSectionTitleEmphasis: str(
        projects.moreSectionTitleEmphasis,
        d.projects.moreSectionTitleEmphasis,
      ),
    },
    skills: {
      sectionNum: str(skills.sectionNum, d.skills.sectionNum),
      sectionLabel: str(skills.sectionLabel, d.skills.sectionLabel),
      titleLead: str(skills.titleLead, d.skills.titleLead),
      titleEmphasis: str(skills.titleEmphasis, d.skills.titleEmphasis),
      titleTail: str(skills.titleTail, d.skills.titleTail),
      legendPrimary: str(skills.legendPrimary, d.skills.legendPrimary),
      legendStrong: str(skills.legendStrong, d.skills.legendStrong),
      legendWorking: str(skills.legendWorking, d.skills.legendWorking),
      groups: normalizeSkillGroups(skills.groups, d.skills.groups),
      languagesLabel: str(skills.languagesLabel, d.skills.languagesLabel),
      languages: normalizeLanguages(skills.languages, d.skills.languages),
    },
    contact: {
      sectionNum: str(contact.sectionNum, d.contact.sectionNum),
      sectionLabel: str(contact.sectionLabel, d.contact.sectionLabel),
      headlineLine1: str(contact.headlineLine1, d.contact.headlineLine1),
      headlineLine2Highlight: str(
        contact.headlineLine2Highlight,
        d.contact.headlineLine2Highlight,
      ),
      headlineLine3: str(contact.headlineLine3, d.contact.headlineLine3),
      headlineLine4Italic: str(
        contact.headlineLine4Italic,
        d.contact.headlineLine4Italic,
      ),
      blurb: str(contact.blurb, d.contact.blurb),
      primaryEmailLabel: str(
        contact.primaryEmailLabel,
        d.contact.primaryEmailLabel,
      ),
      primaryEmail: str(contact.primaryEmail, d.contact.primaryEmail),
      portfolioUrl: normalizeHttpsPortfolioUrl(
        contact.portfolioUrl,
        d.contact.portfolioUrl,
      ),
      channels: normalizeChannels(contact.channels, d.contact.channels),
    },
    footer: {
      firstName: str(footer.firstName, d.footer.firstName),
      lastName: str(footer.lastName, d.footer.lastName),
      copyrightName: str(footer.copyrightName, d.footer.copyrightName),
      statusLabel: str(footer.statusLabel, d.footer.statusLabel),
      builtLine: str(footer.builtLine, d.footer.builtLine),
      githubHref: str(footer.githubHref, d.footer.githubHref),
      linkedinHref: str(footer.linkedinHref, d.footer.linkedinHref),
      emailHref: str(footer.emailHref, d.footer.emailHref),
    },
  };
}

function readPortfolioJsonFile(): unknown | null {
  try {
    const raw = fs.readFileSync(PORTFOLIO_PATH, 'utf8');
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readLegacySiteFile(): SiteContent | null {
  try {
    const raw = fs.readFileSync(LEGACY_SITE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return normalizeSiteContent(parsed, defaultPortfolioData.site);
  } catch {
    return null;
  }
}

function buildSeedFromDisk(): PortfolioData {
  const fromFile = readPortfolioJsonFile();
  if (fromFile) return normalizePortfolioData(fromFile);
  const base = structuredClone(defaultPortfolioData);
  const legacySite = readLegacySiteFile();
  if (legacySite) base.site = legacySite;
  return base;
}

function writePortfolioJsonFile(data: PortfolioData): void {
  fs.mkdirSync(path.dirname(PORTFOLIO_PATH), { recursive: true });
  fs.writeFileSync(
    PORTFOLIO_PATH,
    JSON.stringify(data, null, 2) + '\n',
    'utf8',
  );
}

/** Document missing, `{}`, or no usable `site` object — treat as empty DB. */
function isMainDocumentEffectivelyEmpty(
  raw: Record<string, unknown> | undefined,
): boolean {
  if (!raw) return true;
  if (Object.keys(raw).length === 0) return true;
  if (!isRecord(raw.site)) return true;
  if (Object.keys(raw.site).length === 0) return true;
  return false;
}

/** Old/partial docs (e.g. hero-only) — merge defaults and persist full shape. */
function isPortfolioStructureIncomplete(raw: unknown): boolean {
  if (!isRecord(raw)) return true;
  return TOP_LEVEL_PORTFOLIO_KEYS.some((k) => raw[k as string] === undefined);
}

async function readLegacyFirestoreSite(
  db: NonNullable<ReturnType<typeof getFirestoreServer>>,
): Promise<SiteContent | null> {
  try {
    const snap = await db
      .collection(FIRESTORE_COLLECTION)
      .doc(FIRESTORE_DOC_LEGACY_SITE)
      .get();
    if (!snap.exists) return null;
    return normalizeSiteContent(
      snap.data(),
      defaultPortfolioData.site,
    );
  } catch {
    return null;
  }
}

/**
 * Firestore rejects `undefined` in nested maps; JSON round-trip drops those keys
 * and guarantees plain serializable data (also strips any stray non-JSON values).
 */
function toFirestoreSafeDocument(data: PortfolioData): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
}

/**
 * Full portfolio document for the public site and admin merges.
 * Firestore: `portfolio/main`.
 *
 * When the DB is empty or the main doc is missing / `{}` / has no `site`, we
 * write the full portfolio (disk `data/portfolio.json` → `site-content.json`
 * → code defaults, plus legacy `portfolio/siteContent` merged into `site`).
 *
 * When the doc exists but is missing top-level sections (old partial writes),
 * we merge with defaults and **persist** the complete document once.
 */
export async function getPortfolioData(): Promise<PortfolioData> {
  const db = getFirestoreServer();

  if (!db) {
    const seed = buildSeedFromDisk();
    return normalizePortfolioData(seed);
  }

  const ref = db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC_MAIN);
  const snap = await ref.get();
  const raw = snap.exists
    ? (snap.data() as Record<string, unknown> | undefined)
    : undefined;

  if (!snap.exists || isMainDocumentEffectivelyEmpty(raw)) {
    let seed = buildSeedFromDisk();
    const legacySite = await readLegacyFirestoreSite(db);
    if (legacySite) seed = { ...seed, site: { ...seed.site, ...legacySite } };
    const full = normalizePortfolioData(seed);
    await ref.set(toFirestoreSafeDocument(full));
    return full;
  }

  const normalized = normalizePortfolioData(raw);

  if (isPortfolioStructureIncomplete(raw)) {
    await ref.set(toFirestoreSafeDocument(normalized));
    return normalized;
  }

  return normalized;
}

export async function writePortfolioData(
  data: PortfolioData,
): Promise<PortfolioPersistTarget> {
  const normalized = normalizePortfolioData(data);
  const payload = toFirestoreSafeDocument(normalized);
  const db = getFirestoreServer();
  if (!db) {
    writePortfolioJsonFile(payload as PortfolioData);
    return 'local';
  }
  try {
    await db
      .collection(FIRESTORE_COLLECTION)
      .doc(FIRESTORE_DOC_MAIN)
      .set(payload);
    return 'firestore';
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Firestore write to portfolio/main failed: ${msg}. Check the service account has Editor (or Cloud Datastore User) on this project and that the payload is valid.`,
    );
  }
}

/**
 * Writes the full default portfolio (disk → legacy site merge → normalize)
 * to `portfolio/main`, replacing whatever was there. Use when you want to
 * reset Firestore to bundled defaults; for normal empty-DB seeding,
 * `getPortfolioData()` is enough.
 */
export async function writeDefaultPortfolioToFirestore(): Promise<PortfolioData> {
  const db = getFirestoreServer();
  if (!db) {
    throw new Error('FIRESTORE_ADMIN_NOT_CONFIGURED');
  }
  let seed = buildSeedFromDisk();
  const legacySite = await readLegacyFirestoreSite(db);
  if (legacySite) seed = { ...seed, site: { ...seed.site, ...legacySite } };
  const full = normalizePortfolioData(seed);
  await db
    .collection(FIRESTORE_COLLECTION)
    .doc(FIRESTORE_DOC_MAIN)
    .set(toFirestoreSafeDocument(full));
  return full;
}
