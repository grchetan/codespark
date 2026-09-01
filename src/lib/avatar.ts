export function getDiceBearAvatar(seed: string = 'CodeSpark'): string {
  const cleanSeed = encodeURIComponent(seed.trim().toLowerCase() || 'codespark');
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanSeed}`;
}

export function resolveAvatar(avatar?: string | null, name?: string | null, email?: string | null): string {
  if (avatar && !avatar.includes('unsplash.com') && !avatar.includes('photo-1534528741775')) {
    return avatar;
  }
  const seed = (email || name || 'CodeSparkUser').trim().toLowerCase();
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export const defaultAdminAvatar = getDiceBearAvatar('chetan');
export const defaultCreatorAvatar = getDiceBearAvatar('codesparkcore');
