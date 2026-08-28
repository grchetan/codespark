import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { db } from './db';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://vvrrscotkreonhrgxodn.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cnJzY290a3Jlb25ocmd4b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTI3OTQsImV4cCI6MjEwMzQ4ODc5NH0.Oh9qqOdNpTM8QfQSF9MHPjG61gffjh0-Qs0kSYSctS4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedCloudDatabase() {
  console.log('🚀 Syncing local CodeSpark effects & data to Supabase PostgreSQL Cloud Database...');

  try {
    // 1. Fetch all effects from local SQLite
    const localEffects = db.prepare('SELECT * FROM effects').all() as any[];
    console.log(`Found ${localEffects.length} local effects to upload.`);

    for (const eff of localEffects) {
      let parsedTags: any[] = [];
      let parsedSteps: any[] = [];
      try { parsedTags = JSON.parse(eff.tags || '[]'); } catch { parsedTags = [eff.category]; }
      try { parsedSteps = JSON.parse(eff.steps || '[]'); } catch { parsedSteps = []; }

      const payload = {
        id: eff.id,
        slug: eff.slug,
        name: eff.name,
        description: eff.description || '',
        image: eff.image || '',
        category: eff.category,
        category_label: eff.category_label || eff.category,
        tags: parsedTags,
        difficulty: eff.difficulty || 'medium',
        license: eff.license || 'MIT',
        likes: eff.likes || 0,
        saves: eff.saves || 0,
        views: eff.views || 1,
        author_id: eff.author_id || 'u_chetan',
        author_name: eff.author_name || 'Chetan Prajapat',
        author_handle: eff.author_handle || '@chetan',
        author_avatar: eff.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
        html_code: eff.html_code || '',
        css_code: eff.css_code || '',
        js_code: eff.js_code || '',
        instructions: eff.instructions || 'Follow step instructions below.',
        steps: parsedSteps,
        status: eff.status || 'published',
      };

      const { error } = await supabase.from('effects').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn(`⚠️ Warning syncing effect ${eff.name}:`, error.message);
      } else {
        console.log(`✅ Synced to Supabase: ${eff.name}`);
      }
    }

    // 2. Fetch users and sync
    const localUsers = db.prepare('SELECT * FROM users').all() as any[];
    for (const u of localUsers) {
      const { error } = await supabase.from('users').upsert({
        id: u.id,
        name: u.name,
        email: u.email,
        password_hash: u.password_hash,
        role: u.role || 'member',
        status: u.status || 'active',
        avatar: u.avatar || '',
        bio: u.bio || '',
        effects_count: u.effects_count || 0
      }, { onConflict: 'email' });
      if (error) {
        console.warn(`⚠️ Warning syncing user ${u.name}:`, error.message);
      } else {
        console.log(`✅ Synced User to Supabase: ${u.name} (${u.role})`);
      }
    }

    console.log('🎉 All CodeSpark data successfully synced to Supabase Cloud Database!');
  } catch (err: any) {
    console.error('❌ Error syncing to Supabase:', err.message);
  }
}

seedCloudDatabase();
