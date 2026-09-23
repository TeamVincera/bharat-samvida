'use client';
import {T} from '@/components/LocaleProvider';

import {useLocale} from '@/components/LocaleProvider';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PdfReader } from '@/components/PdfReader';
import { LegalDocument } from '@/lib/types';
import { CategoryHierarchy } from '@/lib/corpus';
import { Locale, translations } from '@/lib/i18n';
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Layers
} from 'lucide-react';

export default function LibraryPage() {
  const {locale, setLocale} = useLocale();
  const t = translations[locale].library;

  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [taxonomy, setTaxonomy] = useState<CategoryHierarchy[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ 'Procurement': true, 'BIS framework': true });

  // Selected Document for Reader
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);

  // Fetch documents on mount or query change
  useEffect(() => {
    const controller = new AbortController();
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        if (selectedSubCategory !== 'All') params.set('subcategory', selectedSubCategory);
        if (selectedType !== 'All') params.set('type', selectedType);

        const res = await fetch(`/api/v1/documents?${params.toString()}`, {signal:controller.signal});
        const data = await res.json();
        setDocuments(data.documents || []);
        if (data.taxonomy) setTaxonomy(data.taxonomy);

        // Default to first document if available and none selected
        setSelectedDoc(current => data.documents?.find((doc:LegalDocument)=>doc.id===current?.id) || data.documents?.[0] || null);
      } catch (err) {
        if (!controller.signal.aborted) console.error('Failed to load legal documents');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    const timeout = setTimeout(fetchDocs, 250);
    return () => {clearTimeout(timeout);controller.abort();};
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedType]);

  const toggleCategoryOpen = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSelectCategory = (topCat: string, subCat?: string) => {
    setSelectedCategory(topCat);
    setSelectedSubCategory(subCat || 'All');
  };

  return (
    <>
      <Navbar
        variant="app"
        locale={locale}
        onToggleLocale={() => setLocale(locale === 'en' ? 'hi' : 'en')}
      />

      <main id="main-content" className="library-page" style={{ flex: 1, padding: '32px 24px', background: 'var(--paper)' }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div className="eyebrow" style={{ marginBottom: '4px' }}><T text={" Official Standards & Procurement Repository "}/></div>
            <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--ink-950)' }}>
              {t.title}
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--ink-500)', marginTop: '4px' }}>
              {t.subtitle}
            </p>
          </div>

          {/* Three-Column Legal Library Workspace */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 320px 1fr',
              gap: '20px',
              minHeight: '700px'
            }}
            className="library-workspace-grid"
          >
            {/* COLUMN 1: CATEGORY SIDEBAR */}
            <aside
              style={{
                background: '#F0F2EB',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                padding: '20px 14px',
                height: 'fit-content'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingLeft: '8px' }}>
                <Layers size={16} color="var(--forest-700)" />
                <strong style={{ fontSize: '14px', color: 'var(--ink-950)' }}><T text={"Taxonomy"}/></strong>
              </div>

              {/* All Documents Button */}
              <button
                type="button"
                onClick={() => handleSelectCategory('All')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: selectedCategory === 'All' ? 600 : 500,
                  backgroundColor: selectedCategory === 'All' ? '#E0E8DC' : 'transparent',
                  color: selectedCategory === 'All' ? 'var(--forest-700)' : 'var(--ink-950)',
                  marginBottom: '8px',
                  cursor: 'pointer'
                }}
              ><T text={" All Documents "}/></button>

              {/* Taxonomy Disclosure Groups */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {taxonomy.map(group => {
                  const isOpen = openCategories[group.category];
                  const isCatSelected = selectedCategory === group.category;

                  return (
                    <div key={group.category}>
                      <button
                        type="button"
                        onClick={() => {
                          toggleCategoryOpen(group.category);
                          handleSelectCategory(group.category);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: isCatSelected ? 600 : 500,
                          backgroundColor: isCatSelected ? '#E0E8DC' : 'transparent',
                          color: isCatSelected ? 'var(--forest-700)' : 'var(--ink-950)',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          <span><T text={group.category}/></span>
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--ink-500)' }}>({group.count})</span>
                      </button>

                      {/* Subcategories list */}
                      {isOpen && (
                        <div style={{ paddingLeft: '22px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {group.subcategories.map(sub => (
                            <button
                              key={sub.name}
                              type="button"
                              onClick={() => handleSelectCategory(group.category, sub.name)}
                              style={{
                                textAlign: 'left',
                                padding: '6px 8px',
                                fontSize: '11px',
                                color: selectedSubCategory === sub.name ? 'var(--forest-700)' : '#53694E',
                                fontWeight: selectedSubCategory === sub.name ? 600 : 400,
                                borderLeft: selectedSubCategory === sub.name ? '2px solid var(--forest-700)' : 'none',
                                cursor: 'pointer'
                              }}
                            >
                              {<T text={sub.name}/>} ({sub.count})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* COLUMN 2: SEARCH & DOCUMENT LIST */}
            <section
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                height: 'fit-content',
                maxHeight: '800px',
                overflowY: 'auto'
              }}
            >
              {/* Search Box */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: '16px'
                }}
              >
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-500)'
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: '#F0F2EC',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Results Count */}
              <div style={{ fontSize: '11px', color: 'var(--ink-500)', marginBottom: '12px' }}>
                {loading ? <T text={"Searching repository..."}/> : `${documents.length} ${locale==='hi'?'दस्तावेज़ मिले':'documents found'}`}
              </div>

              {/* Documents List */}
              {documents.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--ink-500)', fontSize: '13px' }}>
                  {t.emptyCategory}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {documents.map(doc => {
                    const isSelected = selectedDoc?.id === doc.id;
                    return (
                      <article
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--forest-700)' : '1px solid var(--line)',
                          backgroundColor: isSelected ? 'var(--forest-tint)' : 'var(--surface)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="badge badge-forest" style={{ fontSize: '10px' }}>
                            {doc.id}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--ink-500)' }}>
                            {<T text={doc.legal_type.replaceAll('_',' ')}/>}
                          </span>
                        </div>

                        <h4
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            marginTop: '6px',
                            color: 'var(--ink-950)',
                            lineHeight: 1.4
                          }}
                        >
                          {<T text={doc.title}/>}
                        </h4>

                        <p style={{ fontSize: '11px', color: 'var(--ink-500)', marginTop: '4px' }}>
                          {<T text={doc.issuer}/>}
                        </p>

                        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span className={`badge ${doc.availability === 'downloaded' ? 'badge-forest' : 'badge-river'}`} style={{ fontSize: '9px' }}>
                            {doc.availability === 'downloaded' ? <T text={"PDF Verified"}/> : <T text={"Source Link"}/>}
                          </span>
                          {doc.page_count && (
                            <span style={{ fontSize: '10px', color: 'var(--ink-500)' }}>
                              {doc.page_count}<T text={" pages "}/></span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* COLUMN 3: PDF READER & VIEWER */}
            <section style={{ height: '100%' }}>
              {selectedDoc ? (
                <PdfReader key={selectedDoc.id} document={selectedDoc} />
              ) : (
                <div
                  className="card-paper"
                  style={{
                    height: '100%',
                    minHeight: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ink-500)',
                    padding: '40px',
                    textAlign: 'center'
                  }}
                >
                  <FileText size={48} style={{ color: 'var(--line)', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}><T text={"Select a document to read"}/></h3>
                  <p style={{ fontSize: '13px', maxWidth: '400px', marginTop: '6px' }}><T text={" Choose any procurement manual, BIS Act, or Quality Control Order from the repository list to inspect its official text. "}/></p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </>
  );
}
