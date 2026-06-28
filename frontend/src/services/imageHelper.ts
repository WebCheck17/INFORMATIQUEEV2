// services/imageHelper.ts
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/WebCheck17/INFORMATIQUEEV2/main/frontend/images/';

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return `${IMAGE_BASE_URL}default-1.png`;
  
  // Kalo sudah URL lengkap, pake langsung
  if (path.startsWith('http')) return path;
  
  // Kalo sudah absolute path (lokal), pake langsung
  if (path.startsWith('/images/')) return path;
  if (path.startsWith('/')) return path;
  
  // Default: tambahin base URL
  return `${IMAGE_BASE_URL}${path}`;
};

export const getAvatarUrl = (avatar: string | undefined, gender?: string): string => {
  if (!avatar || avatar === 'default-avatar.png') {
    return gender === 'female' 
      ? `${IMAGE_BASE_URL}default-2.png` 
      : `${IMAGE_BASE_URL}default-1.png`;
  }
  return getImageUrl(avatar);
};
