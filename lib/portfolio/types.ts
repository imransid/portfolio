export type SiteContent = {
  roleTagline: string;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  experienceMeta: string;
  experienceFocus: string;
};

export type NavItem = {
  label: string;
  href: string;
  num: string;
};

export type Stat = { n: string; label: string; source?: string };

export type ExperienceRole = {
  company: string;
  title: string;
  period: string;
  years: string;
  bullets: string[];
  tech: string[];
};

export type ProjectLink = { label: string; url: string };

export type Project = {
  name: string;
  tagline: string;
  description: string;
  period: string;
  category: string;
  tech: string[];
  links: ProjectLink[];
  accent: string;
  number: string;
  /** Status pill. 'Live' | 'In production' | 'Demo' | 'Case study'. Empty = no pill. */
  status?: string;
};

export type SkillLevel = 'Primary' | 'Strong' | 'Working';

export type SkillItem = { name: string; level: SkillLevel };

export type SkillGroup = {
  label: string;
  heading: string;
  items: SkillItem[];
};

export type ContactChannelIcon =
  | 'mail'
  | 'phone'
  | 'linkedin'
  | 'github'
  | 'map';

export type ContactChannel = {
  label: string;
  value: string;
  href: string;
  icon: ContactChannelIcon;
};

export type LanguageLine = { name: string; note: string };

export type PortfolioData = {
  version: 1;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  site: SiteContent;
  hero: {
    portfolioLine: string;
    headline: string;
    marqueeSkills: string[];
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
  };
  navigation: {
    brandMonogram: string;
    brandName: string;
    availabilityLabel: string;
    timezoneCity: string;
    timeZone: string;
    navItems: NavItem[];
  };
  about: {
    sectionNum: string;
    sectionLabel: string;
    manifestoKicker: string;
    manifestoBody: string;
    headlineLine1Before: string;
    headlineLine1Highlight: string;
    headlineLine2: string;
    headlineLine3Italic: string;
    bodyParagraphs: string[];
    stats: Stat[];
  };
  experience: {
    sectionNum: string;
    sectionLabel: string;
    titleLead: string;
    titleEmphasis: string;
    titleTail: string;
    roles: ExperienceRole[];
  };
  projects: {
    sectionNum: string;
    sectionLabel: string;
    titleLead: string;
    titleEmphasis: string;
    titleMid: string;
    titleTailItalic: string;
    aside: string;
    featured: Project[];
    more: Project[];
    /** One-line "also shipped" archive: employment history, no pills, links or numbers. */
    archiveLine: string;
    moreSectionTitleBefore: string;
    moreSectionTitleEmphasis: string;
  };
  skills: {
    sectionNum: string;
    sectionLabel: string;
    titleLead: string;
    titleEmphasis: string;
    titleTail: string;
    legendPrimary: string;
    legendStrong: string;
    legendWorking: string;
    groups: SkillGroup[];
    languagesLabel: string;
    languages: LanguageLine[];
  };
  contact: {
    sectionNum: string;
    sectionLabel: string;
    headlineLine1: string;
    headlineLine2Highlight: string;
    headlineLine3: string;
    headlineLine4Italic: string;
    blurb: string;
    primaryEmailLabel: string;
    primaryEmail: string;
    /** Public site / CV — optional; empty omits portfolio link in generated CV. */
    portfolioUrl: string;
    channels: ContactChannel[];
  };
  footer: {
    firstName: string;
    lastName: string;
    copyrightName: string;
    statusLabel: string;
    builtLine: string;
    githubHref: string;
    linkedinHref: string;
    emailHref: string;
  };
};
