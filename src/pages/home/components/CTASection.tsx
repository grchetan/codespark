import { Link } from 'react-router-dom';
import NewsletterForm from '@/components/feature/NewsletterForm';
import Reveal from '@/components/base/Reveal';

export default function CTASection() {
  return (
    <section className="container-x pb-16 sm:pb-24 w-full max-w-full overflow-hidden">
      <Reveal>
        <div className="bg-grid relative overflow-hidden rounded-2xl border border-background-300/40 bg-background-100/60 px-4 sm:px-6 py-12 sm:py-16 text-center md:px-16 w-full">
          <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-primary-500/15 blur-[100px]" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-accent-500/15 blur-[100px]" />
          <div className="relative z-10 mx-auto max-w-2xl min-w-0">
            <p className="eyebrow">Share what you build</p>
            <h2 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground-950">
              Your effect could be<br />someone's favorite
            </h2>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-foreground-500 leading-relaxed">
              Publish a hover interaction, a loader, a cursor trick. Get featured, earn likes, and grow your presence in the community.
            </p>
            <div className="mt-6 sm:mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/submit" className="btn btn-primary h-11 sm:h-12 w-full sm:w-auto px-6 sm:px-7 text-xs sm:text-sm">
                Submit an effect
              </Link>
              <Link to="/about" className="btn btn-secondary h-11 sm:h-12 w-full sm:w-auto px-6 sm:px-7 text-xs sm:text-sm">
                How it works
              </Link>
            </div>
            <div className="mt-8 sm:mt-10 border-t border-background-300/50 pt-6 sm:pt-8">
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm font-medium text-foreground-500">Get fresh effects in your inbox every week.</p>
              <div className="mx-auto max-w-md w-full"><NewsletterForm /></div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}