import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TechnologyStrip from '@/components/TechnologyStrip';
import HowItWorks from '@/components/HowItWorks';
import WhyVerifyX from '@/components/WhyVerifyX';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      <Header />
      
      <main>
        <Hero />
        <TechnologyStrip />
        <HowItWorks />
        <WhyVerifyX />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
