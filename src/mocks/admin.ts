export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'banned' | 'pending';
  joined: string;
  effects: number;
  avatar: string;
  reports?: number;
}

export interface Submission {
  id: string;
  name: string;
  category: string;
  author: string;
  email?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  difficulty: string;
  tags: string[];
  description?: string;
  html_code?: string;
  css_code?: string;
  js_code?: string;
  instructions?: string;
  steps?: any[];
}

export interface OfficialEffect {
  id: string;
  name: string;
  slug: string;
  category: string;
  category_label?: string;
  description?: string;
  difficulty?: string;
  status: 'published' | 'draft' | 'archived';
  code: string;
  html_code?: string;
  css_code?: string;
  js_code?: string;
  instructions?: string;
  steps?: any[];
  updatedAt: string;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'content' | 'bug' | 'design';
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'done';
  votes: number;
  requestedBy: string;
  requestedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  submitted_at: string;
  status: 'unread' | 'read' | 'resolved';
}

export const adminUsers: AdminUser[] = [
  { id: 'u_admin_codespark', name: 'Chetan Prajapat', email: 'admin@codespark.dev', role: 'admin', status: 'active', joined: '2026-08-01', effects: 18, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat' },
  { id: 'u_chetan', name: 'Chetan Prajapat', email: 'chetan@codespark.dev', role: 'admin', status: 'active', joined: '2026-08-01', effects: 18, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChetanPrajapat' },
  { id: 'u_codespark', name: 'CodeSpark Official', email: 'core@codespark.dev', role: 'admin', status: 'active', joined: '2026-08-01', effects: 18, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CodeSparkCore' },
];

export const submissions: Submission[] = [];

export const officialEffects: OfficialEffect[] = [];

export const requirements: Requirement[] = [];

export const adminStats = {
  totalEffects: 16,
  totalUsers: 3,
  pendingReviews: 0,
  activeSubmissions: 0,
  bannedUsers: 0,
  unreadMessages: 0,
  monthlyViews: 0,
};

export const recentActivity: { id: string; action: string; target: string; by: string; time: string }[] = [];