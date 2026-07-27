const DEFAULT_MEMBER_AVATAR = 'https://openteens.org/img/logo/2024.png';
const DEFAULT_MEMBER_NAME = '无名氏';
const RAW_DEFAULT_MEMBER_NAME = '🥒';

export const getSafeAvatarUrl = (url, fallback = DEFAULT_MEMBER_AVATAR) => {
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return fallback;
  }
  return fallback;
};

export const getMemberDisplayName = (name) => {
  const normalizedName = (name || '').trim();
  if (!normalizedName || normalizedName === RAW_DEFAULT_MEMBER_NAME) {
    return DEFAULT_MEMBER_NAME;
  }
  return normalizedName;
};
