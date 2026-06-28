// services/imageHelper.ts
export const getGitHubRawUrl = (githubUrl: string): string => {
  // Convert: https://github.com/WebCheck17/INFORMATIQUEEV2/blob/main/frontend/images/bootcamp-1.jpeg
  // To:      https://raw.githubusercontent.com/WebCheck17/INFORMATIQUEEV2/main/frontend/images/bootcamp-1.jpeg
  return githubUrl
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/blob/', '/');
};

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '/images/default-1.png';
  
  // Kalo sudah URL lengkap (http/https)
  if (path.startsWith('http')) {
    // Kalo URL GitHub, convert ke raw
    if (path.includes('github.com') && path.includes('/blob/')) {
      return getGitHubRawUrl(path);
    }
    return path;
  }
  
  // Kalo sudah absolute path
  if (path.startsWith('/images/')) return path;
  if (path.startsWith('/')) return path;
  
  // Default: tambahin /images/ prefix
  return `/images/${path}`;
};
