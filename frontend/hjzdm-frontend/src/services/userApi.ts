import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090';

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token（如果需要）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('User API Error:', error);
    // 根据不同错误类型提供更具体的错误信息
    if (error.response) {
      // 服务器响应错误
      console.error('Response Error:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // 请求已发出但没有响应
      console.error('Request Error:', error.request);
    } else {
      // 其他错误
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 用户API接口定义
export const userApi = {
  // 用户注册
  register: (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    return apiClient.post('/user/register', userData);
  },

  // 用户登录（用户名/邮箱）
  login: (loginData: { username: string; password: string }) => {
    return apiClient.post('/user/login', loginData);
  },

  // 手机号登录
  localLogin: (loginData: { phone: string; password: string }) => {
    return apiClient.post('/user/localLogin', loginData);
  },
};

export default apiClient;
