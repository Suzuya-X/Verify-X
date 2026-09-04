import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">
            Verify before you trust.
          </h2>
          <Link href="/verify" className="inline-block bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            Start Verification
          </Link>
        </div>
      </div>
    </section>
  );
}
