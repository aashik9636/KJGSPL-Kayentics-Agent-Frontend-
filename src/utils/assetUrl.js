export const getAssetUrl = (relativePath) => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Clean up leading slash & append to storage base URL
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const rawBase = import.meta.env.VITE_STORAGE_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://minio-server-xmry.onrender.com';
  const baseUrl = rawBase.replace(/\/+$/, '');
  
  return `${baseUrl}${cleanPath}`;
};
