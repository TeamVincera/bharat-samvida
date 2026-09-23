import {T} from '@/components/LocaleProvider';
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PdfReader } from '@/components/PdfReader';
import { getLegalDocumentById } from '@/lib/corpus';
import { ArrowLeft } from 'lucide-react';

interface DocumentDetailPageProps {
  params: Promise<{ documentId: string }>;
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const doc = getLegalDocumentById((await params).documentId);

  if (!doc) {
    notFound();
  }

  return (
    <>
      <Navbar variant="app" />

      <main id="main-content" style={{ flex: 1, padding: '32px 24px', background: 'var(--paper)' }}>
        <div className="container" style={{ maxWidth: '1180px' }}>
          {/* Breadcrumb Back Button */}
          <div style={{ marginBottom: '20px' }}>
            <Link
              href="/library"
              className="btn btn-outline"
              style={{ minHeight: '36px', padding: '6px 14px', fontSize: '13px' }}
            >
              <ArrowLeft size={14} />
              <span><T text={"Back to Legal Library"}/></span>
            </Link>
          </div>

          <PdfReader document={doc} />
        </div>
      </main>

      <Footer />
    </>
  );
}
