export function getDiceBearAvatar(seed: string = 'CodeSpark'): string {
  const cleanSeed = encodeURIComponent(seed.trim() || 'CodeSpark');
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanSeed}`;
}

export const defaultAdminAvatar = getDiceBearAvatar('Chetan');
export const defaultCreatorAvatar = getDiceBearAvatar('CodeSparkCore');
