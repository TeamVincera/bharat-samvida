import {T} from '@/components/LocaleProvider';
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, Lock, EyeOff, Server, AlertCircle } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <>
      <Navbar variant="app" />

      <main id="main-content" style={{ flex: 1, padding: '48px 24px', background: 'var(--paper)' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          <div className="eyebrow" style={{ marginBottom: '8px' }}><T text={" Data Protection & Privacy Notice "}/></div>
          <h1 className="page-title" style={{ marginBottom: '16px' }}><T text={" Privacy at Bharat Samvida "}/></h1>
          <p className="body-large" style={{ marginBottom: '40px' }}><T text={" Bharat Samvida is built from the ground up on data minimisation, pseudonymisation, and anonymous ephemeral sessions. "}/></p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <EyeOff size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}><T text={"1. Local Pre-Processing & Pseudonymisation"}/></h2>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-700)' }}><T text={" Before any external analysis request is made, your procurement brief undergoes client-side Data Loss Prevention (DLP) checks. Identifiers such as names, phone numbers, email addresses, GSTIN/PAN numbers, bank accounts, and tender reference codes are detected and replaced with draft-scoped placeholders (e.g. "}/><code><T text={"[ORG_1]"}/></code>, <code><T text={"[PERSON_1]"}/></code>).
              </p>
              <div style={{ marginTop: '14px', padding: '12px 16px', background: 'var(--danger-tint)', borderRadius: '8px', color: 'var(--danger-700)', fontSize: '13px' }}>
                <strong><T text={"Credential blocking:"}/></strong><T text={" Passwords, private API keys, and authentication tokens are hard-blocked from ever leaving your device. "}/></div>
            </section>

            <section className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Server size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}><T text={"2. Server-Side Processing & AI Provider Disclosure"}/></h2>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-700)' }}><T text={" When live mode is enabled, server-side inference is routed to "}/><strong><T text={"Groq"}/></strong><T text={" (models: "}/><code><T text={"openai/gpt-oss-20b"}/></code><T text={" and "}/><code><T text={"openai/gpt-oss-120b"}/></code><T text={"). Groq receives only the minimised, redacted technical facts and approved Indian Standards evidence records. Groq never receives original documents, credentials, or user identities. In demonstration mode, zero external API calls are made. "}/></p>
            </section>

            <section className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Lock size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}><T text={"3. Ephemeral Sessions & Zero Account Tracking"}/></h2>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-700)' }}><T text={" There are no public user accounts, logins, or permanent cloud storage of tender drafts. Sessions are identified by cryptographically random 256-bit bearer tokens stored in HttpOnly cookies. Sessions expire after "}/><strong><T text={"30 minutes of inactivity"}/></strong><T text={" and are permanently wiped after a maximum of "}/><strong><T text={"2 hours"}/></strong><T text={". Clicking \"Delete this session\" purges all in-memory drafts immediately. "}/></p>
            </section>

            <section className="card-paper" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Shield size={22} color="var(--forest-700)" />
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}><T text={"4. Digital Personal Data Protection Act, 2023 Compliance"}/></h2>
              </div>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--ink-700)' }}><T text={" Bharat Samvida aligns with the principles of notice, purpose limitation, data minimisation, and prompt erasure under India's Digital Personal Data Protection (DPDP) Act, 2023. "}/></p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
