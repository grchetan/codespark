import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';

const columns = [
  { title: 'Explore', links: [['Effects', '/effects'], ['Trending', '/effects?sort=trending'], ['New', '/effects?sort=new'], ['Categories', '/effects'], ['Search', '/effects?focus=search']] },
  { title: 'Community', links: [['Creators', '/community'], ['Submit Effect', '/submit'], ['Featured', '/community'], ['Guidelines', '/about'], ['FAQ', '/about']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Careers', '/about'], ['License', '/about'], ['Privacy', '/about']] },
];

export default function Footer() {
  return (
    <footer className="w-full max-w-full overflow-hidden border-t border-background-300/40 bg-background-100/60">
      <div className="container-x py-10 sm:py-14 w-full">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr] w-full">
          <div className="min-w-0">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-foreground-950 text-sm text-foreground-950">
                <i className="ri-sparkling-2-fill text-primary-500" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-foreground-950">CODESPARK</span>
            </Link>
            <p className="mt-4 max-w-sm text-xs sm:text-sm leading-relaxed text-foreground-500">
              The living library for frontend effects. Preview, understand, copy and use beautiful UI interactions in your own projects — then share what you build.
            </p>
            <div className="mt-6 max-w-sm w-full">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground-500">Weekly effects, zero spam</p>
              <NewsletterForm dark />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:gap-8 sm:grid-cols-3 min-w-0 w-full">
            {columns.map((col) => (
              <div key={col.title} className="min-w-0">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground-500">{col.title}</h4>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.links.map(([label, to]) => (
                    <li key={label} className="truncate">
                      <Link to={to} className="text-xs sm:text-sm text-foreground-500 transition-colors hover:text-foreground-950">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 sm:mt-12 flex flex-col items-center justify-between gap-4 border-t border-background-300/40 pt-6 sm:flex-row text-center sm:text-left">
          <p className="text-xs text-foreground-500">© {new Date().getFullYear()} CodeSpark. Crafted by developers, for developers.</p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="GitHub" className="text-foreground-500 transition-colors hover:text-foreground-950"><i className="ri-github-fill text-lg" /></a>
            <a href="#" aria-label="X" className="text-foreground-500 transition-colors hover:text-foreground-950"><i className="ri-twitter-x-fill text-lg" /></a>
            <a href="#" aria-label="Discord" className="text-foreground-500 transition-colors hover:text-foreground-950"><i className="ri-discord-fill text-lg" /></a>
            <a href="#" aria-label="YouTube" className="text-foreground-500 transition-colors hover:text-foreground-950"><i className="ri-youtube-fill text-lg" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}