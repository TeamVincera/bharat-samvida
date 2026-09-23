import { NextRequest, NextResponse } from 'next/server';
import { getLegalDocumentById } from '@/lib/corpus';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const docId = (await params).documentId;
  const doc = getLegalDocumentById(docId);

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Check if PDF file exists in public/pdfs
  let pdfAvailable = false;
  let webPdfUrl = null;

  if (doc.local_path) {
    const filename = path.basename(doc.local_path);
    const publicPdfPath = path.join(process.cwd(), 'public', 'pdfs', filename);
    if (fs.existsSync(publicPdfPath)) {
      pdfAvailable = true;
      webPdfUrl = `/pdfs/${filename}`;
    }
  }

  return NextResponse.json({
    document: doc,
    pdfAvailable,
    webPdfUrl: webPdfUrl || doc.pdf_url || doc.source_url
  });
}
