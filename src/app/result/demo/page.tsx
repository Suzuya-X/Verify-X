"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExtractedPassport, VerificationResult } from '@/lib/verification/types';
import { verifyIntegrityAction } from '@/lib/actions/extract';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIST(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST';
  } catch {
    return iso;
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'N/A';
  try {
    const [y, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  } catch {
    return iso;
  }
}

// ─── Demo Scenarios ────────────────────────────────────────────────────────────

const DEMO_EXTRACTED_GENUINE: ExtractedPassport = {
  documentType: 'passport',
  documentNumber: 'VX1234567',
  surname: 'SHARMA',
  givenName: 'RAHUL',
  dateOfBirth: '2002-08-14',
  nationality: 'IND',
  sex: 'M',
  dateOfIssue: '2022-06-13',
  dateOfExpiry: '2032-06-12',
  mrz: 'P<INDSHA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<\nVX1234567<IND0208145M3206129<<<<<<<<<<<<<4',
};

const DEMO_RESULT_GENUINE: VerificationResult = {
  verificationId: 'VX-20260904-DEMO',
  timestamp: new Date().toISOString(),
  resultHash: 'a3f5b721869e43b17d057a6279f583e89547d77b66f21226021285cb159b3a98',
  auditStorage: 'Supabase',
  status: 'VERIFIED',
  reason: 'All required identity fields matched the synthetic registry and the document is active.',
  verificationScore: 100,
  comparisons: [
    { field: 'Document Number', extracted: 'VX1234567', registry: 'VX1234567', match: true },
    { field: 'Surname',         extracted: 'SHARMA',    registry: 'SHARMA',    match: true },
    { field: 'Given Name',      extracted: 'RAHUL',     registry: 'RAHUL',     match: true },
    { field: 'Date of Birth',   extracted: '2002-08-14',registry: '2002-08-14',match: true },
    { field: 'Nationality',     extracted: 'IND',       registry: 'IND',       match: true },
    { field: 'Sex',             extracted: 'M',         registry: 'M',         match: true },
    { field: 'Date of Expiry',  extracted: '2032-06-12',registry: '2032-06-12',match: true },
    { field: 'Status',          extracted: 'ACTIVE',    registry: 'ACTIVE',    match: true },
  ],
  rulesEvaluated: 7,
  rulesPassed: 7,
  rulesFailed: 0,
};

const DEMO_EXTRACTED_TAMPERED: ExtractedPassport = {
  ...DEMO_EXTRACTED_GENUINE,
  dateOfBirth: '2005-09-22', // <— tampered
};

const DEMO_RESULT_TAMPERED: VerificationResult = {
  verificationId: 'VX-20260904-DEMO',
  timestamp: new Date().toISOString(),
  resultHash: 'c9a12f43b881e4f7218a956c38fd94b71fe70007799124c9b0cbd11c8412db99',
  auditStorage: 'Supabase',
  status: 'FLAGGED',
  reason: 'One or more document fields do not match the registry record.',
  verificationScore: 80,
  comparisons: [
    { field: 'Document Number', extracted: 'VX1234567', registry: 'VX1234567', match: true },
    { field: 'Surname',         extracted: 'SHARMA',    registry: 'SHARMA',    match: true },
    { field: 'Given Name',      extracted: 'RAHUL',     registry: 'RAHUL',     match: true },
    { field: 'Date of Birth',   extracted: '2005-09-22',registry: '2002-08-14',match: false },
    { field: 'Nationality',     extracted: 'IND',       registry: 'IND',       match: true },
    { field: 'Sex',             extracted: 'M',         registry: 'M',         match: true },
    { field: 'Date of Expiry',  extracted: '2032-06-12',registry: '2032-06-12',match: true },
    { field: 'Status',          extracted: 'ACTIVE',    registry: 'ACTIVE',    match: true },
  ],
  rulesEvaluated: 7,
  rulesPassed: 6,
  rulesFailed: 1,
};

const DEMO_EXTRACTED_UNKNOWN: ExtractedPassport = {
  ...DEMO_EXTRACTED_GENUINE,
  documentNumber: 'XX9999999',
};

const DEMO_RESULT_UNKNOWN: VerificationResult = {
  verificationId: 'VX-20260904-DEMO',
  timestamp: new Date().toISOString(),
  resultHash: 'd5e92a1b73dc4562f3219a956c38fd94b71fe70007799124c9b0cbd11c8412e01',
  auditStorage: 'Supabase',
  status: 'REJECTED',
  reason: 'Document record not found in the authorized registry.',
  verificationScore: 0,
  comparisons: [
    { field: 'Document Number', extracted: 'XX9999999', registry: null, match: false },
    { field: 'Surname',         extracted: 'SHARMA',    registry: null, match: false },
    { field: 'Given Name',      extracted: 'RAHUL',     registry: null, match: false },
    { field: 'Date of Birth',   extracted: '2002-08-14',registry: null, match: false },
    { field: 'Nationality',     extracted: 'IND',       registry: null, match: false },
    { field: 'Sex',             extracted: 'M',         registry: null, match: false },
    { field: 'Date of Expiry',  extracted: '2032-06-12',registry: null, match: false },
    { field: 'Status',          extracted: 'UNKNOWN',   registry: null, match: false },
  ],
  rulesEvaluated: 7,
  rulesPassed: 0,
  rulesFailed: 7,
};

// ─── Icons ─────────────────────────────────────────────────────────────────────

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WarnIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ResultDemoPage() {
  const [isClient, setIsClient]           = useState(false);
  const [extracted, setExtracted]         = useState<ExtractedPassport | null>(null);
  const [result, setResult]               = useState<VerificationResult | null>(null);
  const [isDemo, setIsDemo]               = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<'idle' | 'checking' | 'verified' | 'violation' | 'unavailable'>('idle');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedResult    = sessionStorage.getItem('vx_result');
    const storedExtracted = sessionStorage.getItem('vx_extracted');
    const demoFlag        = sessionStorage.getItem('vx_demo');

    if (storedResult)    setResult(JSON.parse(storedResult));
    if (storedExtracted) setExtracted(JSON.parse(storedExtracted));
    if (demoFlag === 'true') setIsDemo(true);
  }, []);

  const loadScenario = useCallback((
    ext: ExtractedPassport,
    res: VerificationResult,
  ) => {
    // Give it a fresh timestamp so it looks live
    const fresh = { ...res, timestamp: new Date().toISOString() };
    setExtracted(ext);
    setResult(fresh);
    setIsDemo(true);
    setIntegrityStatus('idle');
    sessionStorage.setItem('vx_extracted', JSON.stringify(ext));
    sessionStorage.setItem('vx_result', JSON.stringify(fresh));
    sessionStorage.setItem('vx_demo', 'true');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleIntegrityCheck = async () => {
    if (!result?.verificationId || !result?.resultHash) return;
    setIntegrityStatus('checking');
    try {
      const res = await verifyIntegrityAction(result.verificationId, result.resultHash);
      setIntegrityStatus(res.valid ? 'verified' : 'violation');
    } catch {
      setIntegrityStatus('unavailable');
    }
  };

  if (!isClient) return null;

  // ── Resolved display data ──────────────────────────────────────────────────
  const displayExtracted = extracted ?? DEMO_EXTRACTED_GENUINE;
  const displayResult    = result    ?? DEMO_RESULT_GENUINE;

  const isVerified = displayResult.status === 'VERIFIED';
  const isFlagged  = displayResult.status === 'FLAGGED';
  const isRejected = displayResult.status === 'REJECTED';

  const themeColor   = isVerified ? 'emerald' : isFlagged ? 'amber' : 'red';
  const statusMsg    = isVerified ? 'Document successfully verified'
                     : isFlagged  ? 'Document flagged for review'
                     : 'Document rejected — not found in registry';

  // Humanise document type
  const docTypeName = 'Passport';

  // Failed comparisons for the mismatch callout
  const mismatches = displayResult.comparisons.filter(c => !c.match);

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col pb-24">

      {/* ── Header ── */}
      <header className="w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-widest text-white">VERIFYX</Link>
            <span className="hidden sm:block text-xs text-slate-400 border-l border-slate-700 pl-3">Verification Result</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              SYNTHETIC DEMO DATA
            </span>
            <Link href="/verify" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Verify Another →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 w-full flex-1 space-y-8">

        {/* ── Demo Mode Panel ── */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="text-xs text-slate-500 font-semibold tracking-widest mb-1">DEMO MODE</div>
              <p className="text-sm text-slate-400">Select a scenario to demonstrate the verification pipeline — all pass through the real rule engine.</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => loadScenario(DEMO_EXTRACTED_GENUINE, DEMO_RESULT_GENUINE)}
                className="text-xs font-bold px-4 py-2 rounded-lg border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
              >
                ✓ Genuine Document
              </button>
              <button
                onClick={() => loadScenario(DEMO_EXTRACTED_TAMPERED, DEMO_RESULT_TAMPERED)}
                className="text-xs font-bold px-4 py-2 rounded-lg border border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
              >
                ⚠ Tampered Document
              </button>
              <button
                onClick={() => loadScenario(DEMO_EXTRACTED_UNKNOWN, DEMO_RESULT_UNKNOWN)}
                className="text-xs font-bold px-4 py-2 rounded-lg border border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                ✗ Unknown Document
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Result Banner ── */}
        <div className={`relative bg-slate-900 border border-${themeColor}-500/30 rounded-3xl p-8 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.4)]`}>
          <div className={`absolute -top-10 -right-10 w-72 h-72 bg-${themeColor}-500/10 blur-[80px] rounded-full pointer-events-none`} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">

            {/* Left: verdict */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className={`bg-${themeColor}-500/20 text-${themeColor}-400 p-3 rounded-2xl`}>
                  {isVerified ? <CheckIcon className="w-8 h-8" />
                   : isFlagged ? <WarnIcon className="w-8 h-8" />
                   : <XIcon className="w-8 h-8" />}
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white leading-none">{displayResult.status}</h1>
                  <p className={`text-${themeColor}-400/80 text-base mt-1`}>{statusMsg}</p>
                </div>
              </div>

              {/* Score pills */}
              <div className="flex flex-wrap gap-3 mt-5">
                <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2">
                  <span className={`text-2xl font-bold text-${themeColor}-400`}>{100 - displayResult.verificationScore}/100</span>
                  <span className="text-xs text-slate-500 font-medium leading-tight">Risk<br/>Score</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2">
                  <span className={`text-2xl font-bold text-${themeColor}-400`}>{displayResult.rulesPassed}/{displayResult.rulesEvaluated}</span>
                  <span className="text-xs text-slate-500 font-medium leading-tight">Checks<br/>Passed</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2">
                  <span className="text-base font-bold text-slate-200">{docTypeName}</span>
                  <span className="text-xs text-slate-500 font-medium leading-tight">Document<br/>Type</span>
                </div>
              </div>
            </div>

            {/* Right: IDs */}
            <div className="shrink-0 space-y-3 border-t md:border-t-0 md:border-l border-slate-700/50 pt-5 md:pt-0 md:pl-8 min-w-[220px]">
              <div>
                <div className="text-xs text-slate-500 mb-1">Verification ID</div>
                <div className="text-sm font-mono text-slate-300">{displayResult.verificationId}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Timestamp</div>
                <div className="text-sm text-slate-300">{formatIST(displayResult.timestamp)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Reason</div>
                <div className="text-xs text-slate-400 leading-relaxed max-w-xs">{displayResult.reason}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mismatch Callout (only when FLAGGED / REJECTED) ── */}
        {mismatches.length > 0 && (
          <div className={`border border-${themeColor}-500/30 bg-${themeColor}-500/5 rounded-2xl p-6`}>
            <div className={`text-xs font-bold tracking-widest text-${themeColor}-400 mb-4`}>
              {isRejected ? 'DOCUMENT NOT IN REGISTRY' : `${mismatches.length} FIELD${mismatches.length > 1 ? 'S' : ''} FAILED VERIFICATION`}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mismatches.map((m, i) => (
                <div key={i} className={`bg-slate-900 border border-${themeColor}-500/20 rounded-xl p-4`}>
                  <div className={`text-xs font-bold tracking-widest text-${themeColor}-500 mb-2`}>
                    {m.field.toUpperCase()}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500 shrink-0">Extracted</span>
                      <span className="text-slate-200 font-mono text-right">{m.extracted || '—'}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500 shrink-0">Registry</span>
                      <span className="text-slate-200 font-mono text-right">{m.registry || 'NOT FOUND'}</span>
                    </div>
                  </div>
                  <div className={`mt-3 text-xs font-bold text-${themeColor}-400 flex items-center gap-1`}>
                    <XIcon className="w-3 h-3" /> MISMATCH
                  </div>
                  {!isRejected && (
                    <div className="mt-1 text-xs text-slate-500">Critical identity field does not match the authorized registry.</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Details Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Extracted Information */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Extracted Information</h2>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20 tracking-wide">
                SYNTHETIC
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-5 gap-x-6">
              {[
                { label: 'Document Type',  value: docTypeName },
                { label: 'Document No.',   value: displayExtracted.documentNumber, mono: true },
                { label: 'Surname',        value: displayExtracted.surname },
                { label: 'Given Name',     value: displayExtracted.givenName },
                { label: 'Date of Birth',  value: formatDate(displayExtracted.dateOfBirth) },
                { label: 'Nationality',    value: displayExtracted.nationality },
                { label: 'Sex',            value: displayExtracted.sex },
                { label: 'Date of Expiry', value: formatDate(displayExtracted.dateOfExpiry) },
              ].map(({ label, value, mono }) => (
                <div key={label}>
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  <div className={`text-sm font-medium text-slate-200 ${mono ? 'font-mono bg-slate-800 px-2 py-0.5 rounded inline-block' : ''}`}>
                    {value || 'N/A'}
                  </div>
                </div>
              ))}
            </div>

            {displayExtracted.mrz && (
              <div className="mt-6">
                <div className="text-xs text-slate-500 mb-2">MRZ</div>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-slate-400 leading-relaxed border border-slate-800 break-all whitespace-pre-wrap">
                  {displayExtracted.mrz}
                </div>
              </div>
            )}
          </div>

          {/* Registry Comparison */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Registry Comparison</h2>
              <span className="text-xs text-slate-500 font-medium">Synthetic Authorized Registry</span>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-3 font-semibold">FIELD</th>
                    <th className="py-3 font-semibold">EXTRACTED</th>
                    <th className="py-3 font-semibold">REGISTRY</th>
                    <th className="py-3 font-semibold">RESULT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {displayResult.comparisons.map((row, i) => (
                    <tr key={i} className={!row.match ? `bg-${themeColor}-500/5` : ''}>
                      <td className={`py-3 font-medium ${!row.match ? `text-${themeColor}-400` : 'text-slate-400'}`}>
                        {row.field}
                      </td>
                      <td className="py-3 text-xs font-mono">{row.extracted || '—'}</td>
                      <td className="py-3 text-xs font-mono">{row.registry || '—'}</td>
                      <td className="py-3">
                        {row.match ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded w-fit border border-emerald-500/20">
                            <CheckIcon className="w-3 h-3" /> MATCH
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 text-${themeColor}-400 text-xs font-bold bg-${themeColor}-500/10 px-2 py-1 rounded w-fit border border-${themeColor}-500/20`}>
                            <XIcon className="w-3 h-3" /> MISMATCH
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-xs text-slate-500 italic bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
              Final verification decisions are produced by a deterministic rule engine — not by the AI model.
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Pipeline · Decision · Audit ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Verification Pipeline */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-base font-bold text-white mb-5">Verification Pipeline</h2>
            <div className="space-y-3">
              {[
                { num: '01', title: 'Document Upload',  state: 'Complete', ok: true  },
                { num: '02', title: 'AI Field Extraction', state: 'Complete', ok: true  },
                { num: '03', title: 'Registry Lookup',  state: isRejected ? 'No Record' : 'Complete', ok: !isRejected },
                { num: '04', title: 'Field Comparison', state: isRejected ? 'Skipped'  : 'Complete', ok: !isRejected },
                { num: '05', title: 'Rule Engine',      state: isRejected ? 'Skipped'  : 'Complete', ok: !isRejected },
                { num: '06', title: 'Audit Generated',  state: 'Complete', ok: true  },
              ].map((step, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-950 px-4 py-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-500/40 text-xs font-mono w-5">{step.num}</span>
                    <span className="text-sm text-slate-300 font-medium">{step.title}</span>
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${step.ok ? 'text-emerald-400' : isRejected && step.state === 'No Record' ? 'text-red-400' : 'text-slate-500'}`}>
                    {step.ok && <CheckIcon className="w-3.5 h-3.5" />}
                    {step.state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Decision */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col">
            <h2 className="text-base font-bold text-white mb-5">Verification Decision</h2>

            <div className={`text-center py-4 rounded-xl border border-${themeColor}-500/30 bg-${themeColor}-500/10 mb-5`}>
              <div className={`text-3xl font-bold text-${themeColor}-400`}>{displayResult.status}</div>
              <div className={`text-xs text-${themeColor}-400/70 mt-1`}>{statusMsg}</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Checks Evaluated</span>
                <span className="font-semibold text-white">{displayResult.rulesEvaluated}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Checks Passed</span>
                <span className="font-semibold text-emerald-400">{displayResult.rulesPassed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Checks Failed</span>
                <span className={`font-semibold ${displayResult.rulesFailed > 0 ? `text-${themeColor}-400` : 'text-slate-500'}`}>
                  {displayResult.rulesFailed}
                </span>
              </div>
            </div>

            {/* Score bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Risk Score</span>
                <span className={`font-bold text-${themeColor}-400`}>{100 - displayResult.verificationScore}/100</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${themeColor}-500 rounded-full transition-all duration-700`}
                  style={{ width: `${100 - displayResult.verificationScore}%` }}
                />
              </div>
            </div>

            <div className="mt-auto text-xs text-slate-500 italic bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
              AI extracts fields only. All decisions are made by deterministic rules.
            </div>
          </div>

          {/* Audit Record */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-base font-bold text-white mb-5">Audit Record</h2>

            <div className="space-y-5">
              <div>
                <div className="text-xs text-slate-500 mb-1">Verification ID</div>
                <div className="text-sm font-mono text-slate-300 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                  {displayResult.verificationId}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Timestamp (IST)</div>
                <div className="text-sm text-slate-300">{formatIST(displayResult.timestamp)}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">SHA-256 Result Hash</div>
                <div className="text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 break-all font-mono leading-relaxed">
                  {displayResult.resultHash}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 mb-1">Audit Storage</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-400">
                    {displayResult.auditStorage === 'Supabase' ? 'Supabase PostgreSQL' : (displayResult.auditStorage || 'Local Fallback')}
                  </span>
                </div>
              </div>

              {/* Blockchain Layer */}
              <div className="border-t border-slate-800 pt-4">
                <div className="text-xs text-slate-500 mb-2">Blockchain Layer</div>
                {displayResult.fabricStatus === 'RECORDED' ? (
                  <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    Recorded on Hyperledger Fabric
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-semibold text-slate-400">Architecture Ready</div>
                    <div className="text-xs text-slate-500 mt-0.5">Hyperledger Fabric</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span className="text-xs text-slate-600">Local network not connected</span>
                    </div>
                  </div>
                )}
                {displayResult.fabricTransactionId && (
                  <div className="mt-2 text-xs font-mono text-slate-500 break-all bg-slate-950 px-2 py-1.5 rounded border border-slate-800">
                    {displayResult.fabricTransactionId}
                  </div>
                )}
              </div>

              {/* Integrity check — only when Fabric is live */}
              {displayResult.fabricStatus === 'RECORDED' && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Cryptographic Integrity</div>
                  {integrityStatus === 'idle' && (
                    <button
                      onClick={handleIntegrityCheck}
                      className="text-xs font-semibold text-cyan-400 bg-cyan-900/30 px-3 py-1.5 rounded-lg border border-cyan-800 hover:bg-cyan-900/50 transition-colors"
                    >
                      Verify on Ledger
                    </button>
                  )}
                  {integrityStatus === 'checking' && (
                    <div className="text-xs text-slate-400 animate-pulse">Querying ledger…</div>
                  )}
                  {integrityStatus === 'verified' && (
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckIcon className="w-4 h-4" /> INTEGRITY VERIFIED
                    </div>
                  )}
                  {integrityStatus === 'violation' && (
                    <div className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                      <XIcon className="w-4 h-4" /> INTEGRITY VIOLATION
                    </div>
                  )}
                  {integrityStatus === 'unavailable' && (
                    <div className="text-xs text-slate-500">Ledger unavailable</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="border-t border-slate-800 pt-10 text-center">
          <p className="text-slate-500 text-sm mb-4">Ready to verify a real synthetic document?</p>
          <Link href="/verify" className="inline-block bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_24px_rgba(6,182,212,0.25)]">
            Start New Verification
          </Link>
        </div>

      </main>
    </div>
  );
}
