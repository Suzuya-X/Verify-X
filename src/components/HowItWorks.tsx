export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Upload',
      description: 'Upload a passport image (JPG or PNG). The image is compressed in-browser — the original never leaves your device at full size.',
    },
    {
      number: '02',
      title: 'AI Extraction',
      description: 'Gemini multimodal AI reads the document and extracts structured fields: name, DOB, nationality, document number, expiry, MRZ.',
    },
    {
      number: '03',
      title: 'Registry Lookup',
      description: 'Extracted fields are matched against a synthetic authorized registry stored in Supabase PostgreSQL.',
    },
    {
      number: '04',
      title: 'Rule Engine',
      description: 'A deterministic rule engine — not the AI — makes the final VERIFIED, FLAGGED, or REJECTED decision based on field comparisons.',
    },
    {
      number: '05',
      title: 'Audit',
      description: 'A tamper-evident audit record is generated with a SHA-256 result hash, persisted to Supabase, and optionally anchored to Hyperledger Fabric.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Five deterministic stages — AI only touches extraction. Every decision is auditable.
        </p>
        <div className="w-20 h-1 bg-cyan-500 mx-auto rounded-full mt-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((step, i) => (
          <div key={i} className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/50 transition-colors group">
            {/* Connector dot for desktop */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-px bg-slate-700 z-10" />
            )}
            <div className="text-cyan-500/40 text-4xl font-light mb-4">{step.number}</div>
            <h3 className="text-base font-bold text-white mb-2">
              <span className="text-cyan-400 mr-1">—</span>{step.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
