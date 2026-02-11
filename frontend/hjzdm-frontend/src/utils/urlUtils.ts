export const getApiBaseUrl = () => {
  // 在生产环境中使用固定的后端URL，避免环境变量依赖
  if (process.env.NODE_ENV === 'production') {
    return 'https://hjzdm-zx.onrender.com';
  }
  // 开发环境使用默认配置
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
};

export const getImageUrl = (url?: string, defaultPlaceholder: string = 'https://placehold.co/400x300') => {
  if (!url) return defaultPlaceholder;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  const baseUrl = getApiBaseUrl();
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // 特殊处理 /uploads/ 路径
  if (url.startsWith('/uploads/')) {
    return `${cleanBase}${url}`;
  }
  
  if (url.startsWith('/')) {
    return `${cleanBase}${url}`;
  }
  
  return `${cleanBase}/${url}`;
};