import { NextRequest, NextResponse } from 'next/server';
import { createPdf, createDocx, exportSchema } from '@/lib/exports/report';

export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw)>2_000_000) return NextResponse.json({error:'The export is too large.'},{status:413});
    let body: unknown;
    try { body=JSON.parse(raw); } catch { return NextResponse.json({error:'Invalid export request.'},{status:400}); }
    const parsed=exportSchema.safeParse(body);
    if(!parsed.success) return NextResponse.json({error:'The analysis is incomplete or invalid. Please analyse the brief again.'},{status:400});
    const {format,result}=parsed.data;
    if (format !== 'json' && (result.status === 'needs_clarification' || !result.items.length || !result.draftSections.length)) {
      return NextResponse.json({error:'Please complete the clarification questions before preparing the document.'},{status:409});
    }
    const bytes = format==='pdf' ? await createPdf(result) : format==='docx' ? await createDocx(result) : Buffer.from(JSON.stringify(result,null,2));
    const mime={pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',json:'application/json'};
    return new NextResponse(new Uint8Array(bytes),{headers:{
      'Content-Type':mime[format],
      'Content-Disposition':`attachment; filename="bharat-samvida-specification-${new Date().toISOString().slice(0,10)}.${format}"`,
      'Cache-Control':'private, no-store',
      'X-Content-Type-Options':'nosniff'
    }});
  } catch {
    return NextResponse.json({error:'The document could not be generated. Please retry.'},{status:500});
  }
}
