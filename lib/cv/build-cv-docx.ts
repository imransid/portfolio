import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TabStopPosition,
  TabStopType,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import type { ContactChannel, PortfolioData, Project } from '@/lib/portfolio/types';

/** Matches reference CV `.docx` (Word half-points w:sz ≈ 2× pt). */
const SZ = {
  name: 56,
  headline: 24,
  contact: 19,
  section: 22,
  body: 20,
  skillCell: 18,
  roleTitle: 22,
  roleCompany: 20,
  roleDate: 19,
  projectName: 21,
  projectDate: 19,
  linkLine: 19,
};

const BLUE = '1B4F8A';
const GRAY = '555555';
const BODY = '2C2C2C';
const SKILL_FILL = 'D6E4F0';

/** Content width (twips) aligned with prior tab-based layout. */
const CONTENT_WIDTH_TWIP = 9360;

/** Two spaces each side of `|`, same as reference contact & role lines. */
const SEP = '  |  ';

/** Same bullet list as reference (`abstractNumId` 2: indent 480 / hanging 240). */
const CV_LIST_REF = 'cv-list';

const PAGE_MARGIN = {
  top: 1080,
  right: 1080,
  bottom: 1080,
  left: 1080,
};

function esc(s: string): string {
  return s.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
}

/** `tel:` URI from a human-formatted phone (display text unchanged). */
function telUriFromDisplay(phone: string): string {
  const core = phone.replace(/[^\d+]/g, '');
  if (!core) return `tel:${encodeURIComponent(phone.trim())}`;
  return core.startsWith('tel:') ? core : `tel:${core}`;
}

/** Visible text for hyperlinks: no `https://` duplicate; friendly labels for store URLs. */
function linkAnchorDisplayText(url: string, label: string): string {
  const uLower = url.toLowerCase();
  const lLower = label.toLowerCase();
  if (uLower.includes('apps.apple.com') || lLower.includes('app store')) {
    return 'Open on App Store';
  }
  if (uLower.includes('play.google.com') || lLower.includes('play store')) {
    return 'Open on Play Store';
  }
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, '');
    const path =
      parsed.pathname && parsed.pathname !== '/'
        ? parsed.pathname.replace(/\/$/, '')
        : '';
    return `${host}${path}`;
  } catch {
    return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
}

function findChannel(
  channels: ContactChannel[],
  icon: ContactChannel['icon'],
): ContactChannel | undefined {
  return channels.find((c) => c.icon === icon);
}

function contactLineParts(data: PortfolioData): {
  phone: string;
  email: string;
  location: string;
} {
  const phone = findChannel(data.contact.channels, 'phone')?.value ?? '';
  const email = data.contact.primaryEmail || findChannel(data.contact.channels, 'mail')?.value || '';
  const location = data.site.location || findChannel(data.contact.channels, 'map')?.value || '';
  return { phone, email, location };
}

function flattenSkills(data: PortfolioData, max = 24): string[] {
  const names: string[] = [];
  for (const g of data.skills.groups) {
    for (const it of g.items) {
      if (it.name && !names.includes(it.name)) names.push(it.name);
      if (names.length >= max) return names;
    }
  }
  return names;
}

function languagesLine(data: PortfolioData): string {
  const parts = data.skills.languages.map((l) => {
    const note = l.note?.trim();
    return note ? `${l.name} (${note})` : l.name;
  });
  return parts.length ? `Languages: ${parts.join('  |  ')}` : '';
}

const skillCellBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: BLUE },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: BLUE },
  left: { style: BorderStyle.SINGLE, size: 1, color: BLUE },
  right: { style: BorderStyle.SINGLE, size: 1, color: BLUE },
} as const;

function skillCellParagraph(label: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: label,
        bold: true,
        color: BLUE,
        size: SZ.skillCell,
        font: 'Arial',
      }),
    ],
  });
}

function skillDataCell(label: string): TableCell {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    borders: skillCellBorder,
    shading: { fill: SKILL_FILL, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [skillCellParagraph(label)],
  });
}

/**
 * Fixed 5-column skill grid (no spacer columns). Pad row with plain empty cells (no bold placeholder).
 * Trailing row gaps use one merged cell (`gridSpan`) so there is no extra bordered “skill” box.
 */
function buildSkillTable(skills: string[]): Table {
  const cols = 5;
  const colWidth = Math.floor(CONTENT_WIDTH_TWIP / cols);
  const colWidths = Array.from({ length: cols }, (_, i) =>
    i === cols - 1 ? CONTENT_WIDTH_TWIP - colWidth * (cols - 1) : colWidth,
  );

  const items = skills.map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const rows: TableRow[] = [];

  for (let r = 0; r < items.length; r += cols) {
    const slice = items.slice(r, r + cols);
    const cells: TableCell[] = [];
    for (const name of slice) {
      cells.push(skillDataCell(name));
    }
    const short = cols - slice.length;
    if (short > 0) {
      cells.push(
        new TableCell({
          columnSpan: short,
          verticalAlign: VerticalAlign.CENTER,
          borders: skillCellBorder,
          shading: { fill: SKILL_FILL, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({})],
        }),
      );
    }
    rows.push(new TableRow({ children: cells }));
  }

  const tblBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: 'auto',
  } as const;

  return new Table({
    layout: TableLayoutType.FIXED,
    columnWidths: colWidths,
    width: { size: CONTENT_WIDTH_TWIP, type: WidthType.DXA },
    borders: {
      top: tblBorder,
      bottom: tblBorder,
      left: tblBorder,
      right: tblBorder,
      insideHorizontal: tblBorder,
      insideVertical: tblBorder,
    },
    rows,
  });
}

/** Work experience role line: title | company + right-tab date (no table). */
function roleTitleParagraph(title: string, company: string, period: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { before: 200, after: 40 },
    children: [
      new TextRun({
        text: esc(title),
        bold: true,
        color: BLUE,
        size: SZ.roleTitle,
        font: 'Arial',
      }),
      new TextRun({
        text: `${SEP}${esc(company)}`,
        color: GRAY,
        size: SZ.roleCompany,
        font: 'Arial',
      }),
      new TextRun({
        text: `\t${esc(period)}`,
        italics: true,
        color: GRAY,
        size: SZ.roleDate,
        font: 'Arial',
      }),
    ],
  });
}

/** Key project title line: name + right-tab period (no table). */
function projectTitleParagraph(name: string, period: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { before: 180, after: 40 },
    children: [
      new TextRun({
        text: esc(name),
        bold: true,
        color: BLUE,
        size: SZ.projectName,
        font: 'Arial',
      }),
      new TextRun({
        text: `\t${esc(period)}`,
        italics: true,
        color: GRAY,
        size: SZ.projectDate,
        font: 'Arial',
      }),
    ],
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 60 },
    border: {
      bottom: { color: BLUE, space: 2, style: BorderStyle.SINGLE, size: 8 },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        color: BLUE,
        size: SZ.section,
        font: 'Arial',
      }),
    ],
  });
}

function bodyPara(text: string, spacing?: { before?: number; after?: number }): Paragraph {
  return new Paragraph({
    spacing: {
      before: spacing?.before ?? 40,
      after: spacing?.after ?? 40,
    },
    children: [
      new TextRun({
        text: esc(text),
        color: BODY,
        size: SZ.body,
        font: 'Arial',
      }),
    ],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: CV_LIST_REF, level: 0 },
    children: [
      new TextRun({
        text: esc(text),
        color: BODY,
        size: SZ.body,
        font: 'Arial',
      }),
    ],
  });
}

function projectBlocks(project: Project): Paragraph[] {
  const out: Paragraph[] = [];
  const title = project.tagline ? `${project.name}: ${project.tagline}` : project.name;
  out.push(projectTitleParagraph(title, project.period));

  const desc = esc(project.description).trim();
  if (desc) {
    const chunks = desc
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const chunk of chunks.length ? chunks : [desc]) {
      out.push(bulletParagraph(chunk));
    }
  }

  if (project.tech.length) {
    out.push(bulletParagraph(`Technologies: ${project.tech.join(', ')}`));
  }

  for (const link of project.links) {
    const url = link.url.trim();
    if (!url) continue;
    const anchorText = linkAnchorDisplayText(url, link.label);
    out.push(
      new Paragraph({
        spacing: { before: 20, after: 40 },
        children: [
          new TextRun({
            text: `${esc(link.label)}: `,
            bold: true,
            color: GRAY,
            size: SZ.linkLine,
            font: 'Arial',
          }),
          new ExternalHyperlink({
            link: url,
            children: [
              new TextRun({
                text: esc(anchorText),
                color: BLUE,
                size: SZ.linkLine,
                font: 'Arial',
                underline: {},
              }),
            ],
          }),
        ],
      }),
    );
  }
  return out;
}

function educationBlocks(): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 140, after: 40 },
      children: [
        new TextRun({
          text: 'B.Sc. in Software Engineering',
          bold: true,
          color: BLUE,
          size: SZ.roleTitle,
          font: 'Arial',
        }),
        new TextRun({
          text: '  |  Green University of Bangladesh',
          color: GRAY,
          size: SZ.roleCompany,
          font: 'Arial',
        }),
        new TextRun({
          text: '  (Jan 2015 - Jul 2019)',
          italics: true,
          color: GRAY,
          size: SZ.roleDate,
          font: 'Arial',
        }),
      ],
    }),
    bodyPara(
      'Studied algorithms, data structures, AI principles, and the full SDLC. Built mobile and web applications with real-world database and backend integration throughout the program.',
      { before: 40, after: 40 },
    ),
  ];
}

export async function portfolioToCvBuffer(data: PortfolioData): Promise<Buffer> {
  const { phone, email, location } = contactLineParts(data);
  const portfolio = (data.contact.portfolioUrl ?? '').trim();
  const linkedin = data.footer.linkedinHref || findChannel(data.contact.channels, 'linkedin')?.href || '';
  const github = data.footer.githubHref || findChannel(data.contact.channels, 'github')?.href || '';

  const fullName = `${data.site.firstName} ${data.site.lastName}`.trim().toUpperCase();
  const headline = [data.site.roleTagline, data.site.experienceFocus]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(SEP);
  const summary = data.site.bio.trim() || data.about.bodyParagraphs.join(' ');

  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: fullName,
          bold: true,
          color: BLUE,
          size: SZ.name,
          font: 'Arial',
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: esc(headline),
          color: GRAY,
          size: SZ.headline,
          font: 'Arial',
        }),
      ],
    }),
  );

  const contactLineChildren: (TextRun | ExternalHyperlink)[] = [];
  if (phone) {
    contactLineChildren.push(
      new ExternalHyperlink({
        link: telUriFromDisplay(phone),
        children: [
          new TextRun({
            text: esc(phone),
            color: BLUE,
            size: SZ.contact,
            font: 'Arial',
            underline: {},
          }),
        ],
      }),
    );
    if (email || location) {
      contactLineChildren.push(new TextRun({ text: SEP, color: GRAY, size: SZ.contact, font: 'Arial' }));
    }
  }
  if (email) {
    contactLineChildren.push(
      new ExternalHyperlink({
        link: `mailto:${email}`,
        children: [
          new TextRun({
            text: esc(email),
            color: BLUE,
            size: SZ.contact,
            font: 'Arial',
            underline: {},
          }),
        ],
      }),
    );
  }
  if (location) {
    contactLineChildren.push(
      new TextRun({
        text: email ? `${SEP}${esc(location)}` : esc(location),
        color: GRAY,
        size: SZ.contact,
        font: 'Arial',
      }),
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: contactLineChildren.length ? contactLineChildren : [new TextRun({ text: ' ', size: SZ.contact })],
    }),
  );

  const headerLinkSegments: { label: string; url: string }[] = [];
  if (portfolio) headerLinkSegments.push({ label: 'Portfolio', url: portfolio });
  if (linkedin) headerLinkSegments.push({ label: 'LinkedIn', url: linkedin });
  if (github) headerLinkSegments.push({ label: 'GitHub', url: github });

  const headerLinkChildren: (TextRun | ExternalHyperlink)[] = [];
  for (let i = 0; i < headerLinkSegments.length; i++) {
    if (i > 0) {
      headerLinkChildren.push(
        new TextRun({
          text: SEP,
          color: GRAY,
          size: SZ.contact,
          font: 'Arial',
        }),
      );
    }
    const seg = headerLinkSegments[i];
    headerLinkChildren.push(
      new ExternalHyperlink({
        link: seg.url,
        children: [
          new TextRun({
            text: seg.label,
            color: BLUE,
            size: SZ.contact,
            font: 'Arial',
            underline: {},
          }),
        ],
      }),
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: headerLinkChildren.length
        ? headerLinkChildren
        : [new TextRun({ text: ' ', size: SZ.contact, font: 'Arial' })],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { before: 80, after: 100 },
    }),
  );

  children.push(sectionHeading('PROFESSIONAL SUMMARY'));
  children.push(bodyPara(summary, { before: 40, after: 40 }));

  children.push(sectionHeading('CORE SKILLS'));
  const skillNames = flattenSkills(data);
  if (skillNames.length) {
    children.push(buildSkillTable(skillNames));
    children.push(new Paragraph({ spacing: { before: 80 } }));
  } else {
    children.push(bodyPara('-', { before: 80, after: 40 }));
  }

  const langLine = languagesLine(data);
  if (langLine) {
    children.push(bodyPara(langLine, { before: 40, after: 40 }));
  }

  children.push(sectionHeading('WORK EXPERIENCE'));
  for (const role of data.experience.roles) {
    children.push(roleTitleParagraph(role.title, role.company, role.period));
    for (const b of role.bullets) {
      const line = b.trim();
      if (!line) continue;
      children.push(bulletParagraph(line));
    }
  }

  children.push(sectionHeading('EDUCATION'));
  children.push(...educationBlocks());

  children.push(sectionHeading('KEY PROJECTS'));
  for (const p of data.projects.featured) {
    children.push(...projectBlocks(p));
  }
  for (const p of data.projects.more) {
    children.push(...projectBlocks(p));
  }
  const archiveLine = (data.projects.archiveLine ?? '').trim();
  if (archiveLine) {
    children.push(bodyPara(archiveLine, { before: 140, after: 40 }));
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: CV_LIST_REF,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 480, hanging: 240 },
                  spacing: { before: 40, after: 40 },
                },
                run: {
                  font: 'Arial',
                  size: SZ.body,
                  color: BODY,
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: PAGE_MARGIN,
          },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export function cvDownloadFilename(data: PortfolioData): string {
  const base = `${data.site.firstName}_${data.site.lastName}_Lead_Engineer_CV`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '');
  return `${base}.docx`;
}
