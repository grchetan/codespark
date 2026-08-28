import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Hero from './components/Hero';
import ImpactSection from './components/ImpactSection';
import Categories from './components/Categories';
import Trending from './components/Trending';
import Showcase from './components/Showcase';
import Creators from './components/Creators';
import CTASection from './components/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-50">
      <Navbar />
      <main className="w-full max-w-full overflow-x-hidden">
        <Hero />
        <ImpactSection />
        <Categories />
        <Trending />
        <Showcase />
        <Creators />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}