import axios from 'axios';

// 创建axios实例
// 修改说明：
// 1. 移除了硬编码的 localBase 和 tunnelBase
// 2. 依赖 package.json 中的 "proxy": "http://localhost:9090" 配置
// 3. 在开发环境中，API 请求将发送到前端服务器（如 localhost:3000），然后被代理转发到后端（localhost:9090）
// 4. 这解决了跨域问题（CORS）以及云端预览环境下的地址访问问题

const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_BASE_URL || '';
};

const apiBaseUrl = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
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
    console.warn('API Error:', error);
    // 如果需要特定的错误处理逻辑，可以在这里添加
    // 例如：如果 401 未授权，跳转到登录页
    if (error.response && error.response.status === 401) {
        // window.location.href = '/login'; // 可选：自动跳转
    }
    return Promise.reject(error);
  }
);

// API接口定义
export const goodsApi = {
  // 搜索商品
  searchGoods: (query: string, attrFilters?: Record<string, string>, catId?: number) => {
    return apiClient.post('/goods/search', { query, attrFilters, catId });
  },

  // 比价搜索
  compareGoods: (query: string) => {
    return apiClient.post('/goods/compare', { query });
  },

  // 按名称搜索商品
  searchGoodsByName: (query: string) => {
    return apiClient.get(`/goods/searchByName?query=${encodeURIComponent(query)}`);
  },

  // 获取商品详情
  getGoodsDetail: (goodsId: number) => {
    return apiClient.get(`/goods/detail?goodsId=${goodsId}`);
  },

  // 获取所有商品（分页）
  getAllGoods: (page: number = 1, size: number = 20) => {
    return apiClient.post('/goods/pageAll', { pageNum: page, pageSize: size });
  },

  // 新增商品并返回
  addAndReturn: (data: any) => {
    return apiClient.post('/goods/addAndReturn', data);
  },
  
  // 获取本地商品（支持动态属性筛选）
  getGoodsPage: (query: string, attrFilters?: Record<string, string>, catId?: number, page: number = 1, size: number = 20, minPrice?: number, maxPrice?: number, mallTypes?: number[]) => {
    return apiClient.post('/goods/page', { query, attrFilters, catId, pageNum: page, pageSize: size, minPrice, maxPrice, mallTypes });
  },
  
  // 获取我的收藏
  getMyCollect: (page: number = 1, size: number = 20) => {
    return apiClient.post('/goods/myCollect', { pageNum: page, pageSize: size });
  },
  
  // 获取我的商品
  getMyGoods: (page: number = 1, size: number = 20) => {
    return apiClient.post('/goods/myGoods', { pageNum: page, pageSize: size });
  }
};

export const categoryApi = {
  getAttributes: (catId: number) => {
    return apiClient.get(`/category/attributes?catId=${catId}`);
  },
  
  getList: () => {
    return apiClient.post('/category/list');
  },
  
  // 获取分类树
  getTree: () => {
      // 假设有一个获取分类树的接口，如果没有，可以用 getList 代替
      return apiClient.post('/category/list'); 
  }
};

export const disclosureApi = {
  // 新增爆料 (Add new disclosure)
  add: (data: { title: string; content: string; link: string; disclosurePrice: number; imgUrl?: string }) => {
    return apiClient.post('/disclosure/add', data);
  },
  
  // 我的爆料 (My disclosures)
  getMyDisclosure: (page: number = 1, size: number = 20) => {
    return apiClient.post('/disclosure/queryMyDisclosure', { pageNum: page, pageSize: size });
  },

  // 公开爆料 (Public disclosures)
  getPublicDisclosure: (page: number = 1, size: number = 20) => {
    return apiClient.post('/disclosure/queryPublicList', { pageNum: page, pageSize: size });
  },

  // 审核爆料 (Audit)
  audit: (disclosureId: number, status: number) => {
    return apiClient.post('/disclosure/audit', { disclosureId, status });
  },

  // 待审核爆料列表 (Admin pending)
  getPendingDisclosure: (page: number = 1, size: number = 20) => {
    return apiClient.post('/disclosure/queryPendingList', { pageNum: page, pageSize: size });
  },

  // 删除爆料 (Delete disclosure)
  delete: (disclosureId: number) => {
    return apiClient.post('/disclosure/delete', { disclosureId });
  }
};

export const notificationApi = {
  getMyNotifications: () => {
    return apiClient.get('/notification/my');
  },
  markAsRead: (id: number) => {
    return apiClient.post('/notification/read', { id });
  },
  markAllAsRead: () => {
    return apiClient.post('/notification/readAll');
  }
};

export const commonApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/common/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export const userApi = {
  getHistory: (page: number = 1, size: number = 20) => {
    return apiClient.post('/user/queryHistory', { pageNum: page, pageSize: size });
  },
  addHistory: (goodsId: number) => {
    return apiClient.post('/user/addHistory', { goodsId });
  },
  clearHistory: () => {
    return apiClient.post('/user/clearHistory');
  },
  deleteHistory: (goodsId: number) => {
    return apiClient.post('/user/deleteHistory', { goodsId });
  },
  getProfile: () => {
    return apiClient.post('/user/me');
  },
  getMetrics: () => {
    return apiClient.post('/user/metrics');
  },
  register: (userData: { username: string; email: string; password: string; confirmPassword: string }) => {
    return apiClient.post('/user/register', userData);
  },
  login: (loginData: { username: string; password: string }) => {
    return apiClient.post('/user/login', loginData);
  },
  localLogin: (loginData: { phone: string; password: string }) => {
    return apiClient.post('/user/localLogin', loginData);
  }
};

// 商品点赞/收藏相关
export const goodsOperateApi = {
  like: (goodsId: number) => {
    return apiClient.post('/goods/like', { goodsId });
  },
  dislike: (goodsId: number) => {
    return apiClient.post('/goods/dislike', { goodsId });
  },
  collect: (goodsId: number) => {
    return apiClient.post('/goods/collect', { goodsId });
  },
  cancelCollect: (goodsId: number) => {
    return apiClient.post('/goods/cancelCollect', { goodsId });
  }
};

// 爆料点赞/收藏相关
export const disclosureOperateApi = {
  like: (disclosureId: number) => {
    return apiClient.post('/disclosure/like', { disclosureId });
  },
  unlike: (disclosureId: number) => {
    return apiClient.post('/disclosure/unlike', { disclosureId });
  },
  collect: (disclosureId: number) => {
    return apiClient.post('/disclosure/collect', { disclosureId });
  },
  uncollect: (disclosureId: number) => {
    return apiClient.post('/disclosure/uncollect', { disclosureId });
  }
};

export default apiClient;
