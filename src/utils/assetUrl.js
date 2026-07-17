export const getAssetUrl = (relativePath) => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Clean up paths by ensuring a single leading slash
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${baseUrl}${cleanPath}`;
};
