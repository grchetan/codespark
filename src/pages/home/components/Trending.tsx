import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trendingEffects, type Effect } from '@/mocks/effects';
import EffectCard from '@/components/feature/EffectCard';
import Reveal from '@/components/base/Reveal';
import { supabase } from '@/lib/supabase';

export default function Trending() {
  const [effects, setEffects] = useState<Effect[]>(trendingEffects.slice(0, 3));

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data, error } = await supabase
          .from('effects')
          .select('*')
          .order('likes', { ascending: false })
          .limit(3);

        if (!error && data && data.length > 0) {
          const mapped: Effect[] = data.map((e: any) => ({
            id: e.id,
            slug: e.slug || e.id,
            name: e.name,
            description: e.description || '',
            image: e.image || '',
            category: e.category,
            categoryLabel: e.category_label || e.category,
            tags: Array.isArray(e.tags) ? e.tags : [],
            difficulty: e.difficulty || 'medium',
            license: e.license || 'MIT',
            likes: e.likes || 0,
            saves: e.saves || 0,
            views: e.views || 0,
            author: {
              id: e.author_id || 'u_codespark',
              name: e.author_name || 'CodeSpark Official',
              handle: e.author_handle || '@codespark',
              avatar: e.author_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${e.name}`,
              role: 'Creator',
              followers: 0,
              effects: 1,
              bio: '',
              tags: ['verified'],
              verified: true,
            },
            html_code: e.html_code || '',
            css_code: e.css_code || '',
            js_code: e.js_code || '',
            instructions: e.instructions || '',
            steps: e.steps ? (typeof e.steps === 'string' ? JSON.parse(e.steps) : e.steps) : [],
            createdAt: (e.created_at || '2026-09-01').slice(0, 10),
            interactions: ['hover', 'click'],
            isOfficial: e.is_official ?? true,
          }));
          setEffects(mapped);
          return;
        }
      } catch {}

      fetch('/api/effects?sort=trending')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.effects) && data.effects.length > 0) {
            setEffects(data.effects.slice(0, 3));
          }
        })
        .catch(() => {});
    };

    fetchTrending();
  }, []);

  return (
    <section className="w-full max-w-full overflow-hidden border-y border-background-300/40 bg-background-100/40 py-14 sm:py-20">
      <div className="container-x w-full">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Trending now</p>
              <h2 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground-950">
                What the community loves
              </h2>
              <p className="mt-2 sm:mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-foreground-500">
                The effects developers are saving, copying and shipping right now.
              </p>
            </div>
            <Link to="/effects?sort=trending" className="btn btn-ghost text-xs sm:text-sm font-body">
              See trending <i className="ri-fire-line" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {effects.map((e, i) => (
            <Reveal key={e.id} delay={i * 80}>
              <EffectCard effect={e} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}