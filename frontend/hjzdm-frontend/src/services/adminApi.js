import axios from 'axios';

// 创建axios实例
const adminApi = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090/api',
});

// 请求拦截器 - 移除认证相关代码
adminApi.interceptors.request.use(
  (config) => {
    // 不再添加Authorization header，完全移除认证
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 移除401错误处理
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 不再特殊处理401错误，让错误正常传递
    return Promise.reject(error);
  }
);

export default adminApi;