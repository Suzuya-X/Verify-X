import Link from 'next/link';

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
      {/* Left: copy */}
      <div className="flex-1 flex flex-col items-start">
        <div className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-widest mb-8">
          HACKATHON MVP · SYNTHETIC DEMO DATA
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          AI-Powered<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Document Verification
          </span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
          Verify documents against trusted registries with AI-assisted extraction,
          deterministic validation, and a tamper-evident cryptographic audit trail.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/verify"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-3.5 rounded-full font-bold transition-all shadow-[0_0_24px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verify a Document
          </Link>
          <Link
            href="#how-it-works"
            className="px-8 py-3.5 rounded-full font-bold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center"
          >
            See How It Works
          </Link>
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap gap-6 text-xs text-slate-500 font-medium">
          {['AI Extraction', 'Deterministic Rules', 'SHA-256 Audit', 'Supabase Storage'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right: live-result mock card */}
      <div className="flex-1 w-full max-w-md relative shrink-0">
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-2xl" />

        <div className="relative bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div className="text-xs text-slate-500 font-semibold tracking-widest">VERIFICATION RESULT</div>
            <div className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              SYNTHETIC
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Verdict */}
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">VERIFIED</div>
                <div className="text-sm text-emerald-400/80">Document successfully verified</div>
              </div>
            </div>

            {/* Score pills */}
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 text-center">
                <div className="text-xl font-bold text-emerald-400">0/100</div>
                <div className="text-xs text-slate-500 mt-0.5">Risk Score</div>
              </div>
              <div className="flex-1 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 text-center">
                <div className="text-xl font-bold text-emerald-400">7/7</div>
                <div className="text-xs text-slate-500 mt-0.5">Checks Passed</div>
              </div>
            </div>

            {/* Pipeline steps */}
            <div className="space-y-2">
              {['AI Extraction', 'Registry Lookup', 'Field Comparison', 'Rule Engine', 'Audit Generated'].map(step => (
                <div key={step} className="flex items-center justify-between bg-slate-950/70 rounded-lg px-3 py-2">
                  <span className="text-sm text-slate-300">{step}</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete
                  </span>
                </div>
              ))}
            </div>

            {/* Hash preview */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-600 mb-1">SHA-256 Result Hash</div>
              <div className="text-xs text-slate-500 font-mono truncate">a3f5b721869e43b17d057a6279f583e8…</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
