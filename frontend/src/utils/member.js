export const getSafeAvatarUrl = (url, fallback = 'https://via.placeholder.com/50?text=%E9%9B%85') => {
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
