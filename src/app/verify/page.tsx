import Link from 'next/link';
import DocumentUploader from '@/components/DocumentUploader';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-widest text-white">VERIFYX</Link>
            <span className="hidden sm:block text-xs text-slate-400 border-l border-slate-700 pl-3">
              Document Verification
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              SYNTHETIC DEMO DATA
            </span>
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-6">
        <div className="text-center mb-10 max-w-xl w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Verify a Document</h1>
          <p className="text-slate-400 text-lg">
            Upload a synthetic passport to run the full AI-powered verification pipeline.
          </p>
        </div>

        <DocumentUploader />

        {/* Demo mode shortcut */}
        <div className="mt-10 w-full max-w-2xl">
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="text-xs text-slate-500 font-semibold tracking-widest mb-1">DEMO MODE</div>
                <p className="text-sm text-slate-400">
                  No document? Jump straight to the result page and switch between Genuine, Tampered, and Unknown scenarios.
                </p>
              </div>
              <Link
                href="/result/demo"
                className="shrink-0 text-sm font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-5 py-2.5 rounded-xl hover:bg-cyan-500/20 transition-colors text-center"
              >
                View Demo Results →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
