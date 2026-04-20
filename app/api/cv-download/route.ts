import { NextResponse } from 'next/server';
import { cvDownloadFilename, portfolioToCvBuffer } from '@/lib/cv/build-cv-docx';
import { getPortfolioData } from '@/lib/portfolio/store';

export const dynamic = 'force-dynamic';
/** Firebase Admin + `docx` require Node (not Edge). */
export const runtime = 'nodejs';

/**
 * Generates a .docx CV from the same portfolio document as the public site
 * (Firestore `portfolio/main` or `data/portfolio.json`).
 */
export async function GET() {
  try {
    const data = await getPortfolioData();
    const buffer = await portfolioToCvBuffer(data);
    const filename = cvDownloadFilename(data);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'CV generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
