export default function WhyVerifyX() {
  const cards = [
    {
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI-Powered Extraction',
      description: 'Gemini multimodal AI reads complex document images and extracts structured fields with no manual templates or OCR rules.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Deterministic Verification',
      description: 'Final VERIFIED / FLAGGED / REJECTED decisions are made by an explicit rule engine — not by the AI. Results are predictable and auditable.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Tamper-Evident Audit',
      description: 'Every verification produces a SHA-256 result hash, persisted to Supabase and optionally anchored immutably to Hyperledger Fabric.',
    },
  ];

  return (
    <section id="technology" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why VerifyX</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Built on three principles: AI-assisted extraction, rule-based decisions, and cryptographic auditability.
        </p>
        <div className="w-20 h-1 bg-cyan-500 mx-auto rounded-full mt-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/30 transition-colors group">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
              {card.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
