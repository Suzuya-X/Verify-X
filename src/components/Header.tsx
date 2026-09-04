import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-widest text-white">
            VERIFYX
          </Link>
          <span className="hidden md:block text-xs text-slate-400 border-l border-slate-700 pl-3">
            AI-Powered Document Verification
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="#technology" className="hover:text-white transition-colors">Technology</Link>
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
        </nav>
        
        <div className="flex items-center">
          <Link href="/verify" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded-full text-sm font-bold transition-colors">
            Verify a Document
          </Link>
        </div>
      </div>
    </header>
  );
}
