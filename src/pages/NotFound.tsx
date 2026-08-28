import { Link, useLocation } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Reveal from '@/components/base/Reveal';

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background-50">
      <Navbar />
      <main className="container-x flex flex-1 flex-col items-center justify-center pt-32 pb-24 text-center">
        <Reveal>
          <div className="relative mb-6">
            <span className="font-display text-[8rem] font-bold leading-none tracking-tight text-primary-500/20 sm:text-[12rem]">
              404
            </span>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-background-400 bg-background-50 text-3xl text-primary-500 shadow-md">
                <i className="ri-compass-3-line" />
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground-950 sm:text-5xl">
            Lost in the DOM
          </h1>
          <p className="mt-3 max-w-md text-sm text-foreground-500 leading-relaxed">
            The page <code className="rounded bg-background-200 px-1.5 py-0.5 font-mono text-xs text-foreground-950">{location.pathname}</code> does not exist or has moved.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className="btn btn-primary h-11 px-6 text-sm">
              <i className="ri-home-4-line" /> Back to Home
            </Link>
            <Link to="/effects" className="btn btn-secondary h-11 px-6 text-sm">
              <i className="ri-sparkling-2-line" /> Browse Effects
            </Link>
            <Link to="/submit" className="btn btn-ghost h-11 px-6 text-sm">
              <i className="ri-add-circle-line" /> Submit an Effect
            </Link>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
