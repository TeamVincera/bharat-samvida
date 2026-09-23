import {NextRequest,NextResponse} from 'next/server';
import {DocumentLanguageError,hindiDocumentPage,hindiPagePdf} from '@/lib/document-language';
export const runtime='nodejs';
export async function GET(req:NextRequest,{params}:{params:Promise<{documentId:string}>}) {
  const {documentId}=await params;
  try {
    const page=Number(req.nextUrl.searchParams.get('page')||1);
    const result=await hindiDocumentPage(documentId,page);
    if(req.nextUrl.searchParams.get('format')==='pdf')return new NextResponse(new Uint8Array(await hindiPagePdf(result)),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${documentId}-hindi-page-${page}.pdf"`,'Cache-Control':'private, no-store'}});
    return NextResponse.json(result,{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){return NextResponse.json({error:error instanceof DocumentLanguageError?error.message:'अनुवाद उपलब्ध नहीं है।'},{status:error instanceof DocumentLanguageError?error.status:500});}
}
