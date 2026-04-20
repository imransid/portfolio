'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CV_DOWNLOAD_PATH } from '@/lib/cv/download-path';
import type {
  ContactChannel,
  ContactChannelIcon,
  ExperienceRole,
  NavItem,
  PortfolioData,
  Project,
  ProjectLink,
  SkillGroup,
  SkillItem,
  SkillLevel,
  Stat,
} from '@/lib/portfolio/types';

type TabId =
  | 'overview'
  | 'site'
  | 'seo'
  | 'navigation'
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'contact'
  | 'footer'
  | 'firestore';

type ProjectsEditorPanel = 'intro' | 'featured' | 'more';

const TABS: { id: TabId; label: string; hint: string; group: 'content' | 'sitewide' | 'account' }[] = [
  { id: 'site', label: 'Site & hero', hint: 'Name, bio, hero buttons, marquee', group: 'content' },
  { id: 'about', label: 'About', hint: 'Story, stats, paragraphs', group: 'content' },
  { id: 'experience', label: 'Experience', hint: 'Jobs and bullet lists', group: 'content' },
  { id: 'projects', label: 'Projects', hint: 'Featured and more projects', group: 'content' },
  { id: 'skills', label: 'Skills', hint: 'Groups, levels, languages', group: 'content' },
  { id: 'contact', label: 'Contact', hint: 'Headlines and channels', group: 'content' },
  { id: 'footer', label: 'Footer', hint: 'Links and copyright line', group: 'content' },
  { id: 'seo', label: 'SEO', hint: 'Title and meta for Google', group: 'sitewide' },
  { id: 'navigation', label: 'Navigation', hint: 'Header links and labels', group: 'sitewide' },
  { id: 'overview', label: 'Overview', hint: 'Counts and Firebase help', group: 'account' },
  { id: 'firestore', label: 'Firestore', hint: 'Sync or reset the database', group: 'account' },
];

function isTabId(v: string | null): v is TabId {
  return v !== null && TABS.some((t) => t.id === v);
}

function isProjectsPanel(v: string | null): v is ProjectsEditorPanel {
  return v === 'intro' || v === 'featured' || v === 'more';
}

const NAV_GROUPS: { key: 'content' | 'sitewide' | 'account'; title: string }[] = [
  { key: 'content', title: 'Page content' },
  { key: 'sitewide', title: 'Whole site' },
  { key: 'account', title: 'Setup' },
];

const INPUT =
  'w-full min-h-[44px] rounded-xl border border-bone/15 bg-ink-card/90 px-4 py-3 text-base text-bone outline-none transition placeholder:text-bone-dim/50 focus:border-amber-glow/50 focus:ring-2 focus:ring-amber-glow/25 sm:min-h-0 sm:py-2.5 sm:text-sm';
const LABEL =
  'block space-y-2 text-sm font-medium leading-snug text-bone';
const LABEL_HINT = 'text-xs font-normal text-bone-muted';
const CARD =
  'rounded-2xl border border-bone/10 bg-gradient-to-br from-ink-card/90 to-ink-deep/80 p-5 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm';
const BTN =
  'inline-flex min-h-[44px] items-center justify-center rounded-full border border-bone/20 bg-ink-soft/60 px-5 py-2.5 text-sm font-medium text-bone transition hover:border-amber-glow/45 hover:text-amber-glow active:scale-[0.98] sm:min-h-0 sm:py-2 sm:text-xs';
const BTN_DANGER =
  'inline-flex min-h-[44px] items-center justify-center rounded-full border border-red-500/25 bg-red-500/5 px-4 py-2 text-sm font-medium text-red-300/95 transition hover:border-red-400/50 active:scale-[0.98] sm:min-h-0 sm:py-1.5 sm:text-xs';

const ICONS: ContactChannelIcon[] = ['mail', 'phone', 'linkedin', 'github', 'map'];
const LEVELS: SkillLevel[] = ['Primary', 'Strong', 'Working'];

function TextField({
  label,
  value,
  onChange,
  rows,
  placeholder,
  description,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  description?: string;
}) {
  return (
    <label className={LABEL}>
      <span>{label}</span>
      {description ? <span className={`block ${LABEL_HINT}`}>{description}</span> : null}
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT} resize-y min-h-[7rem]`}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT}
        />
      )}
    </label>
  );
}

function LinesField({
  label,
  lines,
  onChange,
  hint,
}: {
  label: string;
  lines: string[];
  onChange: (next: string[]) => void;
  hint?: string;
}) {
  const text = lines.join('\n');
  return (
    <label className={LABEL}>
      <span>{label}</span>
      {hint ? <span className={`block ${LABEL_HINT}`}>{hint}</span> : null}
      <textarea
        rows={Math.min(14, Math.max(4, lines.length + 2))}
        value={text}
        onChange={(e) => onChange(e.target.value.split('\n'))}
        className={`${INPUT} resize-y font-mono text-sm leading-relaxed sm:text-[13px]`}
      />
    </label>
  );
}

function CommaField({
  label,
  values,
  onChange,
  hint,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  hint?: string;
}) {
  return (
    <label className={LABEL}>
      <span>{label}</span>
      {hint ? <span className={`block ${LABEL_HINT}`}>{hint}</span> : null}
      <input
        type="text"
        value={(values ?? []).join(', ')}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        className={INPUT}
      />
    </label>
  );
}

function emptyProject(i: number): Project {
  const n = String(i + 1).padStart(2, '0');
  return {
    name: 'New project',
    tagline: '',
    description: '',
    period: '',
    category: '',
    tech: [],
    links: [],
    accent: '',
    number: n,
  };
}

function emptyRole(): ExperienceRole {
  return {
    company: '',
    title: '',
    period: '',
    years: '',
    bullets: [],
    tech: [],
  };
}

function emptyNav(): NavItem {
  return { label: 'Section', href: '#', num: '00' };
}

function emptyStat(): Stat {
  return { n: '0', label: 'Label' };
}

function emptyChannel(): ContactChannel {
  return {
    label: 'Channel',
    value: '',
    href: '#',
    icon: 'mail',
  };
}

function emptySkillGroup(letter: string): SkillGroup {
  return {
    label: letter,
    heading: 'New group',
    items: [],
  };
}

function emptySkillItem(): SkillItem {
  return { name: 'Skill', level: 'Working' };
}

type Props = {
  initial: PortfolioData;
  firestoreConfigured: boolean;
};

export default function PortfolioDashboard({ initial, firestoreConfigured }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PortfolioData>(initial);
  const [tab, setTab] = useState<TabId>('site');
  const [projectsPanel, setProjectsPanel] = useState<ProjectsEditorPanel>('intro');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [seedErr, setSeedErr] = useState('');
  const [seedDiag, setSeedDiag] = useState('');
  const [seedLoading, setSeedLoading] = useState(false);

  const firebaseProjectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'mine-a6dd0';
  const firebaseServiceAccountsUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/settings/serviceaccounts/adminsdk`;

  useEffect(() => {
    setData(initial);
    setDirty(false);
    setSaved(false);
  }, [initial]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (!isTabId(t)) return;
    setTab(t);
    if (t === 'projects') {
      const p = searchParams.get('projects');
      if (isProjectsPanel(p)) setProjectsPanel(p);
      else setProjectsPanel('intro');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 4500);
    return () => window.clearTimeout(t);
  }, [saved]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const touch = () => {
    setDirty(true);
    setSaved(false);
  };

  function replaceDashboardQuery(next: { tab: TabId; projects?: ProjectsEditorPanel }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next.tab);
    if (next.tab === 'projects') {
      params.set('projects', next.projects ?? 'intro');
    } else {
      params.delete('projects');
    }
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  function goToTab(tabId: TabId, projects?: ProjectsEditorPanel) {
    setTab(tabId);
    if (tabId === 'projects') {
      const panel = projects ?? 'intro';
      setProjectsPanel(panel);
      replaceDashboardQuery({ tab: tabId, projects: panel });
    } else {
      setProjectsPanel('intro');
      replaceDashboardQuery({ tab: tabId });
    }
  }

  function goToProjectsPanel(panel: ProjectsEditorPanel) {
    setProjectsPanel(panel);
    replaceDashboardQuery({ tab: 'projects', projects: panel });
  }

  const onSave = useCallback(async () => {
    setError('');
    setStorageWarning('');
    const pu = (data.contact.portfolioUrl ?? '').trim();
    if (pu && !pu.startsWith('https://')) {
      setError('Portfolio URL must start with https:// or be empty.');
      return;
    }
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error || 'Save failed');
        return;
      }
      const persistedTo = res.headers.get('X-Portfolio-Persisted-To');
      const next = (await res.json()) as PortfolioData;
      setData(next);
      setDirty(false);
      setSaved(true);
      if (firestoreConfigured && persistedTo === 'local') {
        setStorageWarning(
          'This save went to data/portfolio.json only — Firestore was not updated (often a cold-start race or missing Admin credentials on this server). Try Save again, or confirm FIREBASE_SERVICE_ACCOUNT_KEY / FIREBASE_SERVICE_ACCOUNT_PATH on your host matches the Firebase project you are viewing in the console.',
        );
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [data, router, firestoreConfigured]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== 's') return;
      e.preventDefault();
      if (!loading) void onSave();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onSave]);

  function discardChanges() {
    if (!dirty) return;
    if (!window.confirm('Discard all edits and reload the last saved version?')) return;
    setData(structuredClone(initial));
    setDirty(false);
    setSaved(false);
    setError('');
    setStorageWarning('');
  }

  async function onLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  }

  async function onSeedFirestore(replaceDefaults: boolean) {
    setSeedErr('');
    setSeedDiag('');
    setSeedMsg('');
    setSeedLoading(true);
    try {
      const res = await fetch('/api/admin/seed-firestore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replaceDefaults ? { replaceDefaults: true } : {}),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
        hint?: string;
        detail?: string;
        diagnostics?: unknown;
      };
      if (!res.ok) {
        setSeedErr(
          [body.error, body.hint, body.detail].filter(Boolean).join(' — ') || 'Sync failed',
        );
        if (body.diagnostics !== undefined) {
          setSeedDiag(JSON.stringify(body.diagnostics, null, 2));
        }
        return;
      }
      setSeedMsg(body.message || 'Firestore updated.');
      const refreshed = await fetch('/api/portfolio', { credentials: 'include' });
      if (refreshed.ok) {
        setData((await refreshed.json()) as PortfolioData);
        setDirty(false);
      }
      router.refresh();
    } finally {
      setSeedLoading(false);
    }
  }

  function updateProject(
    list: 'featured' | 'more',
    index: number,
    patch: Partial<Project>,
  ) {
    setData((d) => ({
      ...d,
      projects: {
        ...d.projects,
        [list]: d.projects[list].map((p, i) => (i === index ? { ...p, ...patch } : p)),
      },
    }));
    touch();
  }

  function removeProject(list: 'featured' | 'more', index: number) {
    if (!window.confirm('Remove this project from the portfolio document?')) return;
    setData((d) => ({
      ...d,
      projects: {
        ...d.projects,
        [list]: d.projects[list].filter((_, i) => i !== index),
      },
    }));
    touch();
  }

  function addProject(list: 'featured' | 'more') {
    setData((d) => ({
      ...d,
      projects: {
        ...d.projects,
        [list]: [...d.projects[list], emptyProject(d.projects[list].length)],
      },
    }));
    touch();
  }

  function updateProjectLink(
    list: 'featured' | 'more',
    pi: number,
    li: number,
    patch: Partial<ProjectLink>,
  ) {
    setData((d) => ({
      ...d,
      projects: {
        ...d.projects,
        [list]: d.projects[list].map((p, i) => {
          if (i !== pi) return p;
          const links = p.links.map((l, j) => (j === li ? { ...l, ...patch } : l));
          return { ...p, links };
        }),
      },
    }));
    touch();
  }

  function addProjectLink(list: 'featured' | 'more', pi: number) {
    setData((d) => ({
      ...d,
      projects: {
        ...d.projects,
        [list]: d.projects[list].map((p, i) =>
          i === pi ? { ...p, links: [...p.links, { label: 'Link', url: 'https://' }] } : p,
        ),
      },
    }));
    touch();
  }

  function removeProjectLink(list: 'featured' | 'more', pi: number, li: number) {
    setData((d) => ({
      ...d,
      projects: {
        ...d.projects,
        [list]: d.projects[list].map((p, i) =>
          i === pi ? { ...p, links: p.links.filter((_, j) => j !== li) } : p,
        ),
      },
    }));
    touch();
  }

  function renderProjectEditor(list: 'featured' | 'more', title: string) {
    const items = data.projects[list];
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg text-bone">{title}</h3>
            <p className="mt-1 text-sm text-bone-muted">
              Each card is one project. Use the pill bar above to switch between intro, featured, and archive lists.
            </p>
          </div>
          <button type="button" className={`${BTN} shrink-0 justify-center`} onClick={() => addProject(list)}>
            + Add project
          </button>
        </div>
        <div className="space-y-6">
          {items.map((p, i) => (
            <div key={`${list}-${i}`} className={CARD}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm font-medium text-bone">
                  <span className="text-bone-muted">Card {i + 1}</span>
                  <span className="mx-2 text-bone-dim">·</span>
                  {p.name || 'Untitled project'}
                </p>
                <button type="button" className={BTN_DANGER} onClick={() => removeProject(list, i)}>
                  Remove project
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Name" value={p.name} onChange={(v) => updateProject(list, i, { name: v })} />
                <TextField label="Number badge" value={p.number} onChange={(v) => updateProject(list, i, { number: v })} />
                <TextField label="Tagline" value={p.tagline} onChange={(v) => updateProject(list, i, { tagline: v })} />
                <TextField label="Category" value={p.category} onChange={(v) => updateProject(list, i, { category: v })} />
                <TextField label="Period" value={p.period} onChange={(v) => updateProject(list, i, { period: v })} />
                <TextField
                  label="Card gradient accent"
                  description="Tailwind gradient classes for the card edge glow (optional)."
                  value={p.accent}
                  onChange={(v) => updateProject(list, i, { accent: v })}
                  placeholder="from-amber-glow/30 to-transparent"
                />
              </div>
              <div className="mt-4">
                <TextField
                  label="Description"
                  value={p.description}
                  rows={4}
                  onChange={(v) => updateProject(list, i, { description: v })}
                />
              </div>
              <div className="mt-4">
                <CommaField
                  label="Tech stack"
                  hint="Separate with commas, e.g. React Native, NestJS, PostgreSQL"
                  values={p.tech}
                  onChange={(tech) => updateProject(list, i, { tech })}
                />
              </div>
              <div className="mt-5 border-t border-bone/10 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className={LABEL}>Links</span>
                  <button type="button" className={BTN} onClick={() => addProjectLink(list, i)}>
                    Add link
                  </button>
                </div>
                <div className="space-y-2">
                  {p.links.map((link, li) => (
                    <div key={li} className="flex flex-wrap gap-2">
                      <input
                        className={`${INPUT} flex-1 min-w-[8rem]`}
                        value={link.label}
                        placeholder="Label"
                        onChange={(e) => updateProjectLink(list, i, li, { label: e.target.value })}
                      />
                      <input
                        className={`${INPUT} flex-[2] min-w-[10rem]`}
                        value={link.url}
                        placeholder="https://"
                        onChange={(e) => updateProjectLink(list, i, li, { url: e.target.value })}
                      />
                      <button
                        type="button"
                        className={BTN_DANGER}
                        onClick={() => removeProjectLink(list, i, li)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]!;

  return (
    <div className="relative min-h-screen bg-ink-deep">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(245,165,36,0.12),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(132,204,22,0.05),transparent_50%)]" />
      <div className="relative z-10 flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[17.5rem] shrink-0 flex-col border-r border-bone/10 bg-ink/50 px-3 py-7 backdrop-blur-xl lg:flex">
          <div className="mb-6 px-2">
            <h1 className="font-display text-2xl text-bone">Portfolio editor</h1>
            <p className="mt-2 text-sm leading-relaxed text-bone-muted">
              Pick a section, edit fields, then save. Your work goes to{' '}
              <span className="text-bone">{firestoreConfigured ? 'Firestore' : 'data/portfolio.json'}</span>.
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden pr-1 pb-4">
            {NAV_GROUPS.map((g) => (
              <div key={g.key}>
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-bone-dim">
                  {g.title}
                </p>
                <div className="flex flex-col gap-1">
                  {TABS.filter((t) => t.group === g.key).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => goToTab(t.id, t.id === 'projects' ? 'intro' : undefined)}
                      className={`rounded-xl px-3 py-3 text-left transition ${
                        tab === t.id
                          ? 'bg-amber-glow/18 text-bone ring-1 ring-amber-glow/40'
                          : 'text-bone-muted hover:bg-ink-card hover:text-bone'
                      }`}
                    >
                      <span className="block text-sm font-semibold leading-tight">{t.label}</span>
                      <span className={`mt-1 block text-xs leading-snug ${tab === t.id ? 'text-bone/75' : 'text-bone-dim'}`}>
                        {t.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-auto border-t border-bone/10 pt-4">
            <button type="button" onClick={onLogout} className={`${BTN} w-full justify-center border-dashed`}>
              Log out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-[5.5rem] lg:pb-24">
          <header className="sticky top-0 z-20 border-b border-bone/10 bg-ink-deep/90 px-4 py-3 backdrop-blur-md sm:px-8">
            <div className="mx-auto flex max-w-4xl flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-bone-muted lg:hidden">Portfolio editor</p>
                  <h2 className="font-display text-xl text-bone sm:text-2xl">{activeTab.label}</h2>
                  <p className="mt-1 max-w-xl text-sm text-bone-muted">{activeTab.hint}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {dirty ? (
                    <span className="rounded-full border border-amber-glow/40 bg-amber-glow/15 px-3 py-1.5 text-xs font-medium text-amber-glow">
                      Unsaved changes
                    </span>
                  ) : null}
                  {saved ? (
                    <span className="rounded-full border border-signal-green/35 bg-signal-green/10 px-3 py-1.5 text-xs font-medium text-signal-green">
                      Saved
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      firestoreConfigured
                        ? 'border border-signal-green/30 text-signal-green'
                        : 'border border-bone/25 text-bone-muted'
                    }`}
                  >
                    {firestoreConfigured ? 'Cloud' : 'Local file'}
                  </span>
                </div>
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => goToTab(t.id, t.id === 'projects' ? 'intro' : undefined)}
                    className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                      tab === t.id
                        ? 'bg-amber-glow text-ink-deep'
                        : 'bg-ink-card text-bone-muted ring-1 ring-bone/15 hover:text-bone'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
            {error ? (
              <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-200" role="alert">
                {error}
              </p>
            ) : null}
            {storageWarning ? (
              <p
                className="mb-6 rounded-xl border border-amber-glow/35 bg-amber-glow/10 px-4 py-3 text-sm text-bone"
                role="status"
              >
                {storageWarning}
              </p>
            ) : null}

            {tab === 'overview' ? (
              <div className="space-y-6">
                <div className={CARD}>
                  <h2 className="font-display text-2xl text-bone">Start here</h2>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-bone-muted">
                    The live site reads one document:{' '}
                    <span className="font-mono text-bone/90">portfolio/main</span> in Firestore, or{' '}
                    <span className="font-mono text-bone/90">data/portfolio.json</span> when you are offline. Use the
                    buttons below to jump straight into editing.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => goToTab('site')}
                      className="rounded-xl border border-bone/15 bg-ink-deep/50 px-4 py-4 text-left transition hover:border-amber-glow/40 hover:bg-amber-glow/5"
                    >
                      <span className="block text-sm font-semibold text-bone">Name &amp; hero</span>
                      <span className="mt-1 block text-xs text-bone-muted">Tagline, bio, buttons, marquee skills</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => goToTab('projects', 'featured')}
                      className="rounded-xl border border-bone/15 bg-ink-deep/50 px-4 py-4 text-left transition hover:border-amber-glow/40 hover:bg-amber-glow/5"
                    >
                      <span className="block text-sm font-semibold text-bone">Projects</span>
                      <span className="mt-1 block text-xs text-bone-muted">Featured cards and “more” list</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => goToTab('experience')}
                      className="rounded-xl border border-bone/15 bg-ink-deep/50 px-4 py-4 text-left transition hover:border-amber-glow/40 hover:bg-amber-glow/5"
                    >
                      <span className="block text-sm font-semibold text-bone">Experience</span>
                      <span className="mt-1 block text-xs text-bone-muted">Companies, bullets, tech tags</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => goToTab('contact')}
                      className="rounded-xl border border-bone/15 bg-ink-deep/50 px-4 py-4 text-left transition hover:border-amber-glow/40 hover:bg-amber-glow/5"
                    >
                      <span className="block text-sm font-semibold text-bone">Contact</span>
                      <span className="mt-1 block text-xs text-bone-muted">Email, phone, social links</span>
                    </button>
                    <a
                      href={CV_DOWNLOAD_PATH}
                      download
                      className="rounded-xl border border-amber-glow/25 bg-amber-glow/5 px-4 py-4 text-left transition hover:border-amber-glow/45 hover:bg-amber-glow/10 sm:col-span-2"
                    >
                      <span className="block text-sm font-semibold text-bone">Download CV (Word)</span>
                      <span className="mt-1 block text-xs text-bone-muted">
                        Same data as the site — uses route <span className="font-mono text-bone/80">{CV_DOWNLOAD_PATH}</span>
                      </span>
                    </a>
                  </div>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-bone/10 bg-ink-deep/50 p-4">
                      <dt className="text-xs font-medium text-bone-muted">Jobs listed</dt>
                      <dd className="mt-1 font-display text-3xl text-bone">{data.experience.roles.length}</dd>
                    </div>
                    <div className="rounded-xl border border-bone/10 bg-ink-deep/50 p-4">
                      <dt className="text-xs font-medium text-bone-muted">Projects</dt>
                      <dd className="mt-1 font-display text-3xl text-bone">
                        {data.projects.featured.length + data.projects.more.length}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-bone/10 bg-ink-deep/50 p-4">
                      <dt className="text-xs font-medium text-bone-muted">Skill groups</dt>
                      <dd className="mt-1 font-display text-3xl text-bone">{data.skills.groups.length}</dd>
                    </div>
                  </dl>
                </div>
                <div className={`${CARD} border-amber-glow/15`}>
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-amber-glow/90">Credentials</h3>
                  <p className="mt-2 text-xs leading-relaxed text-bone-muted">
                    Place your Firebase service account JSON in <span className="text-bone">secrets/</span> (any{' '}
                    <span className="font-mono text-bone">.json</span> filename) or set{' '}
                    <span className="font-mono text-bone">FIREBASE_SERVICE_ACCOUNT_PATH</span>. Restart{' '}
                    <span className="font-mono text-bone">yarn dev</span> after adding the file.
                  </p>
                  <a
                    href={firebaseServiceAccountsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-medium text-amber-glow underline-offset-4 hover:underline"
                  >
                    Firebase → Service accounts
                  </a>
                </div>
              </div>
            ) : null}

            {tab === 'site' ? (
              <div className="space-y-8">
                <section className={CARD}>
                  <h2 className="font-display text-xl text-bone">Who you are</h2>
                  <p className="mt-1 text-sm text-bone-muted">
                    This text appears in the hero. First and last name also feed other spots on the site—keep them in
                    sync with the footer if you change them.
                  </p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="Role tagline"
                      value={data.site.roleTagline}
                      onChange={(v) => {
                        setData((d) => ({ ...d, site: { ...d.site, roleTagline: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Location"
                      value={data.site.location}
                      onChange={(v) => {
                        setData((d) => ({ ...d, site: { ...d.site, location: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="First name"
                      value={data.site.firstName}
                      onChange={(v) => {
                        setData((d) => ({ ...d, site: { ...d.site, firstName: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Last name"
                      value={data.site.lastName}
                      onChange={(v) => {
                        setData((d) => ({ ...d, site: { ...d.site, lastName: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Experience meta"
                      value={data.site.experienceMeta}
                      onChange={(v) => {
                        setData((d) => ({ ...d, site: { ...d.site, experienceMeta: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Focus label"
                      value={data.site.experienceFocus}
                      onChange={(v) => {
                        setData((d) => ({ ...d, site: { ...d.site, experienceFocus: v } }));
                        touch();
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <TextField
                      label="Bio"
                      value={data.site.bio}
                      rows={5}
                      onChange={(v) => {
                        setData((d) => ({ ...d, site: { ...d.site, bio: v } }));
                        touch();
                      }}
                    />
                  </div>
                </section>
                <section className={CARD}>
                  <h2 className="font-display text-xl text-bone">Hero buttons &amp; marquee</h2>
                  <p className="mt-1 text-sm text-bone-muted">
                    Marquee: put one skill or phrase per line. Buttons use normal web links (<span className="font-mono text-bone/80">#projects</span>,{' '}
                    <span className="font-mono text-bone/80">mailto:…</span>, etc.).
                  </p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="Portfolio line"
                      value={data.hero.portfolioLine}
                      onChange={(v) => {
                        setData((d) => ({ ...d, hero: { ...d.hero, portfolioLine: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Primary CTA label"
                      value={data.hero.ctaPrimaryLabel}
                      onChange={(v) => {
                        setData((d) => ({ ...d, hero: { ...d.hero, ctaPrimaryLabel: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Primary CTA href"
                      value={data.hero.ctaPrimaryHref}
                      onChange={(v) => {
                        setData((d) => ({ ...d, hero: { ...d.hero, ctaPrimaryHref: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Secondary CTA label"
                      value={data.hero.ctaSecondaryLabel}
                      onChange={(v) => {
                        setData((d) => ({ ...d, hero: { ...d.hero, ctaSecondaryLabel: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Secondary CTA href"
                      value={data.hero.ctaSecondaryHref}
                      onChange={(v) => {
                        setData((d) => ({ ...d, hero: { ...d.hero, ctaSecondaryHref: v } }));
                        touch();
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <LinesField
                      label="Marquee skills"
                      lines={data.hero.marqueeSkills}
                      onChange={(lines) => {
                        setData((d) => ({ ...d, hero: { ...d.hero, marqueeSkills: lines } }));
                        touch();
                      }}
                      hint="One skill per line (order is preserved)."
                    />
                  </div>
                </section>
              </div>
            ) : null}

            {tab === 'seo' ? (
              <section className={`${CARD} space-y-4`}>
                <h2 className="font-display text-xl text-bone">SEO</h2>
                <TextField
                  label="Page title"
                  value={data.seo.title}
                  onChange={(v) => {
                    setData((d) => ({ ...d, seo: { ...d.seo, title: v } }));
                    touch();
                  }}
                />
                <TextField
                  label="Meta description"
                  value={data.seo.description}
                  rows={4}
                  onChange={(v) => {
                    setData((d) => ({ ...d, seo: { ...d.seo, description: v } }));
                    touch();
                  }}
                />
                <CommaField
                  label="Keywords"
                  values={data.seo.keywords}
                  onChange={(keywords) => {
                    setData((d) => ({ ...d, seo: { ...d.seo, keywords } }));
                    touch();
                  }}
                />
              </section>
            ) : null}

            {tab === 'navigation' ? (
              <section className={`${CARD} space-y-5`}>
                <h2 className="font-display text-xl text-bone">Navigation</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Brand monogram"
                    value={data.navigation.brandMonogram}
                    onChange={(v) => {
                      setData((d) => ({ ...d, navigation: { ...d.navigation, brandMonogram: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="Brand name"
                    value={data.navigation.brandName}
                    onChange={(v) => {
                      setData((d) => ({ ...d, navigation: { ...d.navigation, brandName: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="Availability label"
                    value={data.navigation.availabilityLabel}
                    onChange={(v) => {
                      setData((d) => ({ ...d, navigation: { ...d.navigation, availabilityLabel: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="Timezone city"
                    value={data.navigation.timezoneCity}
                    onChange={(v) => {
                      setData((d) => ({ ...d, navigation: { ...d.navigation, timezoneCity: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="IANA time zone"
                    value={data.navigation.timeZone}
                    onChange={(v) => {
                      setData((d) => ({ ...d, navigation: { ...d.navigation, timeZone: v } }));
                      touch();
                    }}
                    placeholder="Asia/Dhaka"
                  />
                </div>
                <div className="border-t border-bone/10 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-bone">Nav items</h3>
                    <button
                      type="button"
                      className={BTN}
                      onClick={() => {
                        setData((d) => ({
                          ...d,
                          navigation: {
                            ...d.navigation,
                            navItems: [...d.navigation.navItems, emptyNav()],
                          },
                        }));
                        touch();
                      }}
                    >
                      Add item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.navigation.navItems.map((item, i) => (
                      <div key={i} className="flex flex-wrap gap-2 rounded-xl border border-bone/10 bg-ink-deep/40 p-3">
                        <input
                          className={`${INPUT} w-14 shrink-0 font-mono`}
                          value={item.num}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => ({
                              ...d,
                              navigation: {
                                ...d.navigation,
                                navItems: d.navigation.navItems.map((it, j) =>
                                  j === i ? { ...it, num: v } : it,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <input
                          className={`${INPUT} flex-1 min-w-[6rem]`}
                          value={item.label}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => ({
                              ...d,
                              navigation: {
                                ...d.navigation,
                                navItems: d.navigation.navItems.map((it, j) =>
                                  j === i ? { ...it, label: v } : it,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <input
                          className={`${INPUT} flex-[2] min-w-[8rem]`}
                          value={item.href}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => ({
                              ...d,
                              navigation: {
                                ...d.navigation,
                                navItems: d.navigation.navItems.map((it, j) =>
                                  j === i ? { ...it, href: v } : it,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <button
                          type="button"
                          className={BTN_DANGER}
                          onClick={() => {
                            if (!window.confirm('Remove this nav item?')) return;
                            setData((d) => ({
                              ...d,
                              navigation: {
                                ...d.navigation,
                                navItems: d.navigation.navItems.filter((_, j) => j !== i),
                              },
                            }));
                            touch();
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {tab === 'about' ? (
              <section className={`${CARD} space-y-5`}>
                <h2 className="font-display text-xl text-bone">About</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ['sectionNum', 'Section number'],
                      ['sectionLabel', 'Section label'],
                      ['manifestoKicker', 'Manifesto kicker'],
                      ['manifestoBody', 'Manifesto body'],
                      ['headlineLine1Before', 'Headline · before highlight'],
                      ['headlineLine1Highlight', 'Headline · highlight'],
                      ['headlineLine2', 'Headline · line 2'],
                      ['headlineLine3Italic', 'Headline · italic'],
                    ] as const
                  ).map(([key, label]) => (
                    <TextField
                      key={key}
                      label={label}
                      value={data.about[key]}
                      onChange={(v) => {
                        setData((d) => ({ ...d, about: { ...d.about, [key]: v } }));
                        touch();
                      }}
                    />
                  ))}
                </div>
                <LinesField
                  label="Body paragraphs"
                  lines={data.about.bodyParagraphs}
                  onChange={(bodyParagraphs) => {
                    setData((d) => ({ ...d, about: { ...d.about, bodyParagraphs } }));
                    touch();
                  }}
                />
                <div className="border-t border-bone/10 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-bone">Stats</h3>
                    <button
                      type="button"
                      className={BTN}
                      onClick={() => {
                        setData((d) => ({
                          ...d,
                          about: { ...d.about, stats: [...d.about.stats, emptyStat()] },
                        }));
                        touch();
                      }}
                    >
                      Add stat
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.about.stats.map((s, i) => (
                      <div key={i} className="flex flex-wrap gap-2">
                        <input
                          className={`${INPUT} w-24 shrink-0 font-display text-lg`}
                          value={s.n}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => ({
                              ...d,
                              about: {
                                ...d.about,
                                stats: d.about.stats.map((st, j) => (j === i ? { ...st, n: v } : st)),
                              },
                            }));
                            touch();
                          }}
                        />
                        <input
                          className={`${INPUT} flex-1 min-w-[8rem]`}
                          value={s.label}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => ({
                              ...d,
                              about: {
                                ...d.about,
                                stats: d.about.stats.map((st, j) => (j === i ? { ...st, label: v } : st)),
                              },
                            }));
                            touch();
                          }}
                        />
                        <button
                          type="button"
                          className={BTN_DANGER}
                          onClick={() => {
                            setData((d) => ({
                              ...d,
                              about: {
                                ...d.about,
                                stats: d.about.stats.filter((_, j) => j !== i),
                              },
                            }));
                            touch();
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {tab === 'experience' ? (
              <div className="space-y-6">
                <p className="rounded-xl border border-bone/10 bg-ink-card/50 px-4 py-3 text-sm text-bone-muted">
                  Each job is a card. Bullets are <span className="text-bone">one per line</span>. Tech tags use{' '}
                  <span className="text-bone">commas</span> between names. Scroll down to add another role.
                </p>
                <section className={`${CARD} space-y-5`}>
                  <h2 className="font-display text-xl text-bone">Section heading</h2>
                  <p className={`${LABEL_HINT} -mt-2`}>The big title above your timeline on the public page.</p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="Section number"
                      value={data.experience.sectionNum}
                      onChange={(v) => {
                        setData((d) => ({ ...d, experience: { ...d.experience, sectionNum: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Section label"
                      value={data.experience.sectionLabel}
                      onChange={(v) => {
                        setData((d) => ({ ...d, experience: { ...d.experience, sectionLabel: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Title lead"
                      value={data.experience.titleLead}
                      onChange={(v) => {
                        setData((d) => ({ ...d, experience: { ...d.experience, titleLead: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Title emphasis"
                      value={data.experience.titleEmphasis}
                      onChange={(v) => {
                        setData((d) => ({ ...d, experience: { ...d.experience, titleEmphasis: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Title tail"
                      value={data.experience.titleTail}
                      onChange={(v) => {
                        setData((d) => ({ ...d, experience: { ...d.experience, titleTail: v } }));
                        touch();
                      }}
                    />
                  </div>
                </section>
                <section className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <h2 className="font-display text-xl text-bone">Roles</h2>
                    <button
                      type="button"
                      className={`${BTN} justify-center`}
                      onClick={() => {
                        setData((d) => ({
                          ...d,
                          experience: {
                            ...d.experience,
                            roles: [...d.experience.roles, emptyRole()],
                          },
                        }));
                        touch();
                      }}
                    >
                      + Add job
                    </button>
                  </div>
                  {data.experience.roles.map((role, i) => (
                    <div key={i} className={CARD}>
                      <div className="mb-4 flex flex-wrap justify-between gap-2">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-bone-dim">Role {i + 1}</p>
                        <button
                          type="button"
                          className={BTN_DANGER}
                          onClick={() => {
                            if (!window.confirm('Delete this role?')) return;
                            setData((d) => ({
                              ...d,
                              experience: {
                                ...d.experience,
                                roles: d.experience.roles.filter((_, j) => j !== i),
                              },
                            }));
                            touch();
                          }}
                        >
                          Delete role
                        </button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                          label="Company"
                          value={role.company}
                          onChange={(v) => {
                            setData((d) => ({
                              ...d,
                              experience: {
                                ...d.experience,
                                roles: d.experience.roles.map((r, j) =>
                                  j === i ? { ...r, company: v } : r,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <TextField
                          label="Title"
                          value={role.title}
                          onChange={(v) => {
                            setData((d) => ({
                              ...d,
                              experience: {
                                ...d.experience,
                                roles: d.experience.roles.map((r, j) =>
                                  j === i ? { ...r, title: v } : r,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <TextField
                          label="Period"
                          value={role.period}
                          onChange={(v) => {
                            setData((d) => ({
                              ...d,
                              experience: {
                                ...d.experience,
                                roles: d.experience.roles.map((r, j) =>
                                  j === i ? { ...r, period: v } : r,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <TextField
                          label="Years badge"
                          value={role.years}
                          onChange={(v) => {
                            setData((d) => ({
                              ...d,
                              experience: {
                                ...d.experience,
                                roles: d.experience.roles.map((r, j) =>
                                  j === i ? { ...r, years: v } : r,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <LinesField
                          label="Bullets"
                          lines={role.bullets}
                          onChange={(bullets) => {
                            setData((d) => ({
                              ...d,
                              experience: {
                                ...d.experience,
                                roles: d.experience.roles.map((r, j) =>
                                  j === i ? { ...r, bullets } : r,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <CommaField
                          label="Tech tags"
                          values={role.tech}
                          onChange={(tech) => {
                            setData((d) => ({
                              ...d,
                              experience: {
                                ...d.experience,
                                roles: d.experience.roles.map((r, j) =>
                                  j === i ? { ...r, tech } : r,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            ) : null}

            {tab === 'projects' ? (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 rounded-2xl border border-bone/10 bg-ink-card/40 p-2">
                  {(
                    [
                      ['intro', 'Section intro', 'Titles and intro text'],
                      ['featured', 'Featured', `${data.projects.featured.length} projects`],
                      ['more', 'More list', `${data.projects.more.length} projects`],
                    ] as const
                  ).map(([id, title, sub]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => goToProjectsPanel(id)}
                      className={`min-h-[44px] flex-1 rounded-xl px-4 py-3 text-left transition sm:min-h-0 sm:py-2.5 ${
                        projectsPanel === id
                          ? 'bg-amber-glow/20 text-bone ring-1 ring-amber-glow/40'
                          : 'text-bone-muted hover:bg-ink-deep/80 hover:text-bone'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="mt-0.5 block text-xs text-bone-dim">{sub}</span>
                    </button>
                  ))}
                </div>

                {projectsPanel === 'intro' ? (
                  <section className={`${CARD} space-y-5`}>
                    <h2 className="font-display text-xl text-bone">Section intro</h2>
                    <p className={`${LABEL_HINT} -mt-2`}>
                      This is the heading and supporting copy above your project cards on the public site.
                    </p>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextField
                        label="Section number"
                        description="Small index shown next to the section label."
                        value={data.projects.sectionNum}
                        onChange={(v) => {
                          setData((d) => ({ ...d, projects: { ...d.projects, sectionNum: v } }));
                          touch();
                        }}
                      />
                      <TextField
                        label="Section label"
                        value={data.projects.sectionLabel}
                        onChange={(v) => {
                          setData((d) => ({ ...d, projects: { ...d.projects, sectionLabel: v } }));
                          touch();
                        }}
                      />
                      <TextField
                        label="Title — first part"
                        value={data.projects.titleLead}
                        onChange={(v) => {
                          setData((d) => ({ ...d, projects: { ...d.projects, titleLead: v } }));
                          touch();
                        }}
                      />
                      <TextField
                        label="Title — highlighted word"
                        value={data.projects.titleEmphasis}
                        onChange={(v) => {
                          setData((d) => ({ ...d, projects: { ...d.projects, titleEmphasis: v } }));
                          touch();
                        }}
                      />
                      <TextField
                        label="Title — middle"
                        value={data.projects.titleMid}
                        onChange={(v) => {
                          setData((d) => ({ ...d, projects: { ...d.projects, titleMid: v } }));
                          touch();
                        }}
                      />
                      <TextField
                        label="Title — last part (often italic on site)"
                        value={data.projects.titleTailItalic}
                        onChange={(v) => {
                          setData((d) => ({ ...d, projects: { ...d.projects, titleTailItalic: v } }));
                          touch();
                        }}
                      />
                    </div>
                    <TextField
                      label="Aside / sidebar blurb"
                      value={data.projects.aside}
                      rows={3}
                      description="Short paragraph beside the project grid."
                      onChange={(v) => {
                        setData((d) => ({ ...d, projects: { ...d.projects, aside: v } }));
                        touch();
                      }}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextField
                        label="“More work” heading — before emphasis"
                        value={data.projects.moreSectionTitleBefore}
                        onChange={(v) => {
                          setData((d) => ({
                            ...d,
                            projects: { ...d.projects, moreSectionTitleBefore: v },
                          }));
                          touch();
                        }}
                      />
                      <TextField
                        label="“More work” heading — emphasized word"
                        value={data.projects.moreSectionTitleEmphasis}
                        onChange={(v) => {
                          setData((d) => ({
                            ...d,
                            projects: { ...d.projects, moreSectionTitleEmphasis: v },
                          }));
                          touch();
                        }}
                      />
                    </div>
                  </section>
                ) : null}
                {projectsPanel === 'featured' ? renderProjectEditor('featured', 'Featured projects') : null}
                {projectsPanel === 'more' ? renderProjectEditor('more', 'More projects') : null}
              </div>
            ) : null}

            {tab === 'skills' ? (
              <div className="space-y-8">
                <p className="rounded-xl border border-bone/10 bg-ink-card/50 px-4 py-3 text-sm text-bone-muted">
                  Groups are columns on the site (e.g. Mobile, Backend). Inside each group, add skills and pick a
                  level: Primary = every day, Strong = shipped often, Working = used when needed.
                </p>
                <section className={`${CARD} space-y-5`}>
                  <h2 className="font-display text-xl text-bone">Titles &amp; legend</h2>
                  <p className={`${LABEL_HINT} -mt-2`}>Labels for the skills block and the Primary / Strong / Working key.</p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="Section number"
                      value={data.skills.sectionNum}
                      onChange={(v) => {
                        setData((d) => ({ ...d, skills: { ...d.skills, sectionNum: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Section label"
                      value={data.skills.sectionLabel}
                      onChange={(v) => {
                        setData((d) => ({ ...d, skills: { ...d.skills, sectionLabel: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Title lead"
                      value={data.skills.titleLead}
                      onChange={(v) => {
                        setData((d) => ({ ...d, skills: { ...d.skills, titleLead: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Title emphasis"
                      value={data.skills.titleEmphasis}
                      onChange={(v) => {
                        setData((d) => ({ ...d, skills: { ...d.skills, titleEmphasis: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Title tail"
                      value={data.skills.titleTail}
                      onChange={(v) => {
                        setData((d) => ({ ...d, skills: { ...d.skills, titleTail: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Languages label"
                      value={data.skills.languagesLabel}
                      onChange={(v) => {
                        setData((d) => ({ ...d, skills: { ...d.skills, languagesLabel: v } }));
                        touch();
                      }}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TextField
                      label="Legend · primary"
                      value={data.skills.legendPrimary}
                      onChange={(v) => {
                        setData((d) => ({ ...d, skills: { ...d.skills, legendPrimary: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Legend · strong"
                      value={data.skills.legendStrong}
                      onChange={(v) => {
                        setData((d) => ({ ...d, skills: { ...d.skills, legendStrong: v } }));
                        touch();
                      }}
                    />
                    <TextField
                      label="Legend · working"
                      value={data.skills.legendWorking}
                      onChange={(v) => {
                        setData((d) => ({ ...d, skills: { ...d.skills, legendWorking: v } }));
                        touch();
                      }}
                    />
                  </div>
                </section>
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-xl text-bone">Skill groups</h2>
                    <button
                      type="button"
                      className={BTN}
                      onClick={() => {
                        const letter = String.fromCharCode(65 + data.skills.groups.length);
                        setData((d) => ({
                          ...d,
                          skills: {
                            ...d.skills,
                            groups: [...d.skills.groups, emptySkillGroup(letter)],
                          },
                        }));
                        touch();
                      }}
                    >
                      Add group
                    </button>
                  </div>
                  {data.skills.groups.map((g, gi) => (
                    <div key={gi} className={CARD}>
                      <div className="mb-4 flex flex-wrap justify-between gap-2">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-bone-dim">Group {g.label}</p>
                        <button
                          type="button"
                          className={BTN_DANGER}
                          onClick={() => {
                            if (!window.confirm('Delete this skill group?')) return;
                            setData((d) => ({
                              ...d,
                              skills: {
                                ...d.skills,
                                groups: d.skills.groups.filter((_, j) => j !== gi),
                              },
                            }));
                            touch();
                          }}
                        >
                          Delete group
                        </button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                          label="Column label"
                          value={g.label}
                          onChange={(v) => {
                            setData((d) => ({
                              ...d,
                              skills: {
                                ...d.skills,
                                groups: d.skills.groups.map((gr, j) =>
                                  j === gi ? { ...gr, label: v } : gr,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <TextField
                          label="Heading"
                          value={g.heading}
                          onChange={(v) => {
                            setData((d) => ({
                              ...d,
                              skills: {
                                ...d.skills,
                                groups: d.skills.groups.map((gr, j) =>
                                  j === gi ? { ...gr, heading: v } : gr,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                      </div>
                      <div className="mt-4 border-t border-bone/10 pt-4">
                        <div className="mb-2 flex justify-between">
                          <span className="text-xs text-bone-muted">Skills in this group</span>
                          <button
                            type="button"
                            className={BTN}
                            onClick={() => {
                              setData((d) => ({
                                ...d,
                                skills: {
                                  ...d.skills,
                                  groups: d.skills.groups.map((gr, j) =>
                                    j === gi
                                      ? { ...gr, items: [...gr.items, emptySkillItem()] }
                                      : gr,
                                  ),
                                },
                              }));
                              touch();
                            }}
                          >
                            Add skill
                          </button>
                        </div>
                        <div className="space-y-2">
                          {g.items.map((it, ii) => (
                            <div key={ii} className="flex flex-wrap gap-2">
                              <input
                                className={`${INPUT} flex-1 min-w-[10rem]`}
                                value={it.name}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setData((d) => ({
                                    ...d,
                                    skills: {
                                      ...d.skills,
                                      groups: d.skills.groups.map((gr, j) => {
                                        if (j !== gi) return gr;
                                        return {
                                          ...gr,
                                          items: gr.items.map((item, k) =>
                                            k === ii ? { ...item, name: v } : item,
                                          ),
                                        };
                                      }),
                                    },
                                  }));
                                  touch();
                                }}
                              />
                              <select
                                className={`${INPUT} w-36 shrink-0 font-mono text-xs`}
                                value={it.level}
                                onChange={(e) => {
                                  const level = e.target.value as SkillLevel;
                                  setData((d) => ({
                                    ...d,
                                    skills: {
                                      ...d.skills,
                                      groups: d.skills.groups.map((gr, j) => {
                                        if (j !== gi) return gr;
                                        return {
                                          ...gr,
                                          items: gr.items.map((item, k) =>
                                            k === ii ? { ...item, level } : item,
                                          ),
                                        };
                                      }),
                                    },
                                  }));
                                  touch();
                                }}
                              >
                                {LEVELS.map((l) => (
                                  <option key={l} value={l}>
                                    {l}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className={BTN_DANGER}
                                onClick={() => {
                                  setData((d) => ({
                                    ...d,
                                    skills: {
                                      ...d.skills,
                                      groups: d.skills.groups.map((gr, j) => {
                                        if (j !== gi) return gr;
                                        return {
                                          ...gr,
                                          items: gr.items.filter((_, k) => k !== ii),
                                        };
                                      }),
                                    },
                                  }));
                                  touch();
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
                <section className={CARD}>
                  <h3 className="font-display text-lg text-bone">Languages</h3>
                  <div className="mt-4 space-y-2">
                    {data.skills.languages.map((lang, i) => (
                      <div key={i} className="flex flex-wrap gap-2">
                        <input
                          className={`${INPUT} flex-1 min-w-[8rem]`}
                          value={lang.name}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => ({
                              ...d,
                              skills: {
                                ...d.skills,
                                languages: d.skills.languages.map((l, j) =>
                                  j === i ? { ...l, name: v } : l,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <input
                          className={`${INPUT} flex-1 min-w-[8rem]`}
                          value={lang.note}
                          onChange={(e) => {
                            const v = e.target.value;
                            setData((d) => ({
                              ...d,
                              skills: {
                                ...d.skills,
                                languages: d.skills.languages.map((l, j) =>
                                  j === i ? { ...l, note: v } : l,
                                ),
                              },
                            }));
                            touch();
                          }}
                        />
                        <button
                          type="button"
                          className={BTN_DANGER}
                          onClick={() => {
                            setData((d) => ({
                              ...d,
                              skills: {
                                ...d.skills,
                                languages: d.skills.languages.filter((_, j) => j !== i),
                              },
                            }));
                            touch();
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={BTN}
                      onClick={() => {
                        setData((d) => ({
                          ...d,
                          skills: {
                            ...d.skills,
                            languages: [...d.skills.languages, { name: 'Language', note: '' }],
                          },
                        }));
                        touch();
                      }}
                    >
                      Add language
                    </button>
                  </div>
                </section>
              </div>
            ) : null}

            {tab === 'contact' ? (
              <section className={`${CARD} space-y-5`}>
                <h2 className="font-display text-xl text-bone">Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Section number"
                    value={data.contact.sectionNum}
                    onChange={(v) => {
                      setData((d) => ({ ...d, contact: { ...d.contact, sectionNum: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="Section label"
                    value={data.contact.sectionLabel}
                    onChange={(v) => {
                      setData((d) => ({ ...d, contact: { ...d.contact, sectionLabel: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="Headline line 1"
                    value={data.contact.headlineLine1}
                    onChange={(v) => {
                      setData((d) => ({ ...d, contact: { ...d.contact, headlineLine1: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="Headline highlight"
                    value={data.contact.headlineLine2Highlight}
                    onChange={(v) => {
                      setData((d) => ({
                        ...d,
                        contact: { ...d.contact, headlineLine2Highlight: v },
                      }));
                      touch();
                    }}
                  />
                  <TextField
                    label="Headline line 3"
                    value={data.contact.headlineLine3}
                    onChange={(v) => {
                      setData((d) => ({ ...d, contact: { ...d.contact, headlineLine3: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="Headline italic"
                    value={data.contact.headlineLine4Italic}
                    onChange={(v) => {
                      setData((d) => ({
                        ...d,
                        contact: { ...d.contact, headlineLine4Italic: v },
                      }));
                      touch();
                    }}
                  />
                </div>
                <TextField
                  label="Blurb"
                  value={data.contact.blurb}
                  rows={4}
                  onChange={(v) => {
                    setData((d) => ({ ...d, contact: { ...d.contact, blurb: v } }));
                    touch();
                  }}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Primary email label"
                    value={data.contact.primaryEmailLabel}
                    onChange={(v) => {
                      setData((d) => ({
                        ...d,
                        contact: { ...d.contact, primaryEmailLabel: v },
                      }));
                      touch();
                    }}
                  />
                  <TextField
                    label="Primary email"
                    value={data.contact.primaryEmail}
                    onChange={(v) => {
                      setData((d) => ({ ...d, contact: { ...d.contact, primaryEmail: v } }));
                      touch();
                    }}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField
                    label="Portfolio URL"
                    description={
                      (data.contact.portfolioUrl ?? '').trim() !== '' &&
                      !(data.contact.portfolioUrl ?? '').trim().startsWith('https://')
                        ? 'Must start with https:// or leave empty.'
                        : 'CV header link (optional). Must start with https:// or leave empty.'
                    }
                    placeholder="https://"
                    value={data.contact.portfolioUrl ?? ''}
                    onChange={(v) => {
                      setData((d) => ({ ...d, contact: { ...d.contact, portfolioUrl: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="LinkedIn URL"
                    value={data.footer.linkedinHref}
                    onChange={(v) => {
                      setData((d) => ({ ...d, footer: { ...d.footer, linkedinHref: v } }));
                      touch();
                    }}
                  />
                  <TextField
                    label="GitHub URL"
                    value={data.footer.githubHref}
                    onChange={(v) => {
                      setData((d) => ({ ...d, footer: { ...d.footer, githubHref: v } }));
                      touch();
                    }}
                  />
                </div>
                <div className="border-t border-bone/10 pt-4">
                  <div className="mb-3 flex justify-between">
                    <h3 className="text-sm font-medium text-bone">Channels</h3>
                    <button
                      type="button"
                      className={BTN}
                      onClick={() => {
                        setData((d) => ({
                          ...d,
                          contact: {
                            ...d.contact,
                            channels: [...d.contact.channels, emptyChannel()],
                          },
                        }));
                        touch();
                      }}
                    >
                      Add channel
                    </button>
                  </div>
                  <div className="space-y-3">
                    {data.contact.channels.map((ch, i) => (
                      <div key={i} className="rounded-xl border border-bone/10 bg-ink-deep/40 p-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className={INPUT}
                            value={ch.label}
                            onChange={(e) => {
                              const v = e.target.value;
                              setData((d) => ({
                                ...d,
                                contact: {
                                  ...d.contact,
                                  channels: d.contact.channels.map((c, j) =>
                                    j === i ? { ...c, label: v } : c,
                                  ),
                                },
                              }));
                              touch();
                            }}
                          />
                          <select
                            className={`${INPUT} font-mono text-xs`}
                            value={ch.icon}
                            onChange={(e) => {
                              const icon = e.target.value as ContactChannelIcon;
                              setData((d) => ({
                                ...d,
                                contact: {
                                  ...d.contact,
                                  channels: d.contact.channels.map((c, j) =>
                                    j === i ? { ...c, icon } : c,
                                  ),
                                },
                              }));
                              touch();
                            }}
                          >
                            {ICONS.map((ic) => (
                              <option key={ic} value={ic}>
                                {ic}
                              </option>
                            ))}
                          </select>
                          <input
                            className={INPUT}
                            value={ch.value}
                            placeholder="Display value"
                            onChange={(e) => {
                              const v = e.target.value;
                              setData((d) => ({
                                ...d,
                                contact: {
                                  ...d.contact,
                                  channels: d.contact.channels.map((c, j) =>
                                    j === i ? { ...c, value: v } : c,
                                  ),
                                },
                              }));
                              touch();
                            }}
                          />
                          <input
                            className={INPUT}
                            value={ch.href}
                            placeholder="href"
                            onChange={(e) => {
                              const v = e.target.value;
                              setData((d) => ({
                                ...d,
                                contact: {
                                  ...d.contact,
                                  channels: d.contact.channels.map((c, j) =>
                                    j === i ? { ...c, href: v } : c,
                                  ),
                                },
                              }));
                              touch();
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className={`${BTN_DANGER} mt-3`}
                          onClick={() => {
                            setData((d) => ({
                              ...d,
                              contact: {
                                ...d.contact,
                                channels: d.contact.channels.filter((_, j) => j !== i),
                              },
                            }));
                            touch();
                          }}
                        >
                          Remove channel
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {tab === 'footer' ? (
              <section className={`${CARD} space-y-4`}>
                <h2 className="font-display text-xl text-bone">Footer</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ['firstName', 'First name'],
                      ['lastName', 'Last name'],
                      ['copyrightName', 'Copyright name'],
                      ['statusLabel', 'Status label'],
                      ['builtLine', 'Built line'],
                      ['emailHref', 'Email mailto URL'],
                    ] as const
                  ).map(([key, label]) => (
                    <TextField
                      key={key}
                      label={label}
                      value={data.footer[key]}
                      onChange={(v) => {
                        setData((d) => ({ ...d, footer: { ...d.footer, [key]: v } }));
                        touch();
                      }}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {tab === 'firestore' ? (
              <div className={`${CARD} space-y-4`}>
                <h2 className="font-display text-xl text-bone">Firestore tools</h2>
                <p className="text-xs leading-relaxed text-bone-muted">
                  If the database is empty or incomplete, sync fills <span className="font-mono text-bone">portfolio/main</span>{' '}
                  from defaults and disk. Reset overwrites the remote document entirely (after confirmation).
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    disabled={seedLoading}
                    onClick={() => void onSeedFirestore(false)}
                    className={BTN}
                  >
                    {seedLoading ? 'Working…' : 'Sync Firestore (fill empty / fix incomplete)'}
                  </button>
                  <button
                    type="button"
                    disabled={seedLoading}
                    onClick={() => {
                      if (
                        typeof window !== 'undefined' &&
                        !window.confirm(
                          'Replace the entire portfolio document in Firestore with bundled defaults (plus data/site-content.json if present)? This overwrites remote content.',
                        )
                      ) {
                        return;
                      }
                      void onSeedFirestore(true);
                    }}
                    className={BTN_DANGER}
                  >
                    Reset Firestore to defaults
                  </button>
                </div>
                {seedErr ? (
                  <div className="space-y-2" role="alert">
                    <p className="font-mono text-xs text-red-300/90">{seedErr}</p>
                    <a
                      href={firebaseServiceAccountsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs font-medium text-amber-glow underline underline-offset-2 hover:text-bone"
                    >
                      Open Firebase to download the key
                    </a>
                  </div>
                ) : null}
                {seedDiag ? (
                  <pre className="max-h-40 overflow-auto rounded-xl border border-bone/10 bg-ink-deep p-3 font-mono text-[10px] text-bone-muted">
                    {seedDiag}
                  </pre>
                ) : null}
                {seedMsg ? <p className="font-mono text-xs text-signal-green">{seedMsg}</p> : null}
              </div>
            ) : null}
          </main>

          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-bone/15 bg-ink-deep/95 px-4 pt-3 backdrop-blur-lg lg:left-[17.5rem] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-bone-muted sm:max-w-md">
                {loading
                  ? 'Saving your portfolio to storage…'
                  : dirty
                    ? 'You have unsaved edits. Save so visitors see them, or revert to the last saved version.'
                    : saved
                      ? 'Everything on this page matches what is stored.'
                      : 'When you are done editing, save once. Shortcut: Ctrl or ⌘ + S.'}
              </p>
              <div className="flex flex-wrap items-stretch gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={!dirty || loading}
                  onClick={discardChanges}
                  className="min-h-[48px] flex-1 rounded-full border border-bone/25 bg-transparent px-4 text-sm font-medium text-bone-muted transition hover:border-bone/45 hover:text-bone disabled:opacity-40 sm:min-h-0 sm:flex-none sm:px-5"
                >
                  Revert
                </button>
                <button
                  type="button"
                  disabled={loading || !dirty}
                  onClick={() => void onSave()}
                  className="min-h-[48px] flex-[2] rounded-full bg-amber-glow px-6 text-sm font-semibold text-ink-deep shadow-lg shadow-amber-glow/25 transition hover:bg-bone disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:flex-none sm:px-8"
                >
                  {loading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
