export const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090';
};

export const getImageUrl = (url?: string, defaultPlaceholder: string = 'https://placehold.co/400x300') => {
  if (!url) return defaultPlaceholder;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  const baseUrl = getApiBaseUrl();
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  if (url.startsWith('/')) {
    return `${cleanBase}${url}`;
  }
  
  return `${cleanBase}/${url}`;
};
