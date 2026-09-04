import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div className="text-center md:text-left">
          <Link href="/" className="text-2xl font-bold tracking-widest text-white block mb-2">
            VERIFYX
          </Link>
          <p className="text-sm text-slate-400">
            AI-Powered Document Verification
          </p>
        </div>
        
        <div className="flex gap-8 text-sm text-slate-400">
          <Link href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-cyan-400 transition-colors">Contact</Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 text-center text-sm text-slate-600">
        &copy; {new Date().getFullYear()} VerifyX. All rights reserved.
      </div>
    </footer>
  );
}
