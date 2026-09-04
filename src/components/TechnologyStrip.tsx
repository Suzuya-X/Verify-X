export default function TechnologyStrip() {
  const technologies = [
    "AI DOCUMENT ANALYSIS",
    "DETERMINISTIC RULE ENGINE",
    "SECURE REGISTRY",
    "SHA-256 AUDIT",
    "HYPERLEDGER FABRIC"
  ];

  return (
    <div className="w-full border-y border-white/5 bg-slate-900/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 text-xs sm:text-sm font-semibold tracking-widest text-slate-500">
          {technologies.map((tech, i) => (
            <div key={i} className="flex items-center">
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
