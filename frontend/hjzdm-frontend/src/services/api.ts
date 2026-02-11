import axios from 'axios';

/**
 * API服务模块
 * 封装所有前端与后端的HTTP通信接口
 * 提供统一的错误处理和认证机制
 */

/**
 * 获取API基础URL
 * 根据环境变量配置返回相应的API地址
 * @returns {string} API基础URL
 */
const getApiBaseUrl = () => {
  // 优先使用环境变量配置的API地址，否则使用空字符串
  return process.env.REACT_APP_API_BASE_URL || '';
};

// 获取API基础URL
// Force proxy usage through CRA dev server to ensure consistent routing to 8080
const apiBaseUrl = '';

/**
 * 创建axios实例
 * 配置基础URL、超时时间和默认请求头
 */
const apiClient = axios.create({
  baseURL: apiBaseUrl,           // API基础地址
  timeout: 30000,               // 请求超时时间延长到30秒
  headers: {
    'Content-Type': 'application/json',  // 默认请求头
  },
});

/**
 * 请求拦截器
 * 在每个请求发送前自动添加认证信息
 */
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取JWT token
    const token = localStorage.getItem('token');
    if (token) {
      // 在请求头中添加认证信息
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 请求错误处理
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 统一处理API响应和错误
 */
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回成功的响应
    return response;
  },
  (error) => {
    // 响应错误处理
    return Promise.reject(error);
  }
);

export const userApi = {
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
  // 获取浏览历史
  getHistory: (pageNum: number, pageSize: number) => {
    return apiClient.get(`/user/browse-history?pageNum=${pageNum}&pageSize=${pageSize}`);
  },
  // 查询浏览历史（POST方式）
  queryHistory: (queryData: { pageNum: number; pageSize: number }) => {
    return apiClient.post('/user/queryHistory', queryData);
  },
  // 添加浏览历史
  addHistory: (goodsId: number) => {
    return apiClient.post('/user/addHistory', { goodsId });
  },
  // 清空浏览历史
  clearHistory: () => {
    return apiClient.post('/user/clearHistory');
  },
  // 删除浏览历史
  deleteHistory: (goodsId: number) => {
    return apiClient.post('/user/deleteHistory', { goodsId }, {
      params: { goodsId }
    });
  }
};

// 商品相关API接口（移除点赞/收藏功能）
export const goodsApi = {
  /**
   * 搜索商品
   * @param query - 搜索关键词
   * @param attrFilters - 属性筛选条件（可选）
   * @param catId - 分类ID（可选）
   * @returns Promise<ApiResponse>
   */
  searchGoods: (query: string, attrFilters?: Record<string, string>, catId?: number) => {
    return apiClient.post('/goods/search', { query, attrFilters, catId });
  },

  /**
   * 商品比价搜索
   * @param query - 搜索关键词
   * @returns Promise<ApiResponse>
   */
  compareGoods: (query: string) => {
    return apiClient.post('/goods/compare', { query });
  },

  /**
   * 按名称搜索商品
   * @param query - 商品名称
   * @returns Promise<ApiResponse>
   */
  searchGoodsByName: (query: string) => {
    return apiClient.get(`/goods/searchByName?query=${encodeURIComponent(query)}`);
  },

  /**
   * 获取商品详情
   * @param goodsId - 商品ID
   * @returns Promise<ApiResponse>
   */
  getGoodsDetail: (goodsId: number) => {
    return apiClient.get(`/goods/detail?goodsId=${goodsId}`);
  },

  /**
   * 获取喜欢该商品的用户列表
   * @param goodsId - 商品ID
   * @returns Promise<ApiResponse>
   */
  getGoodsLikeUsers: (goodsId: number) => {
    return apiClient.get(`/goods/likeUsers?goodsId=${goodsId}`);
  },

  /**
   * マイ商品を検索
   * @param queryData - 検索パラメータ
   * @returns Promise<ApiResponse>
   */
  getMyGoods: (queryData: { pageNum: number; pageSize: number }) => {
    return apiClient.post('/goods/myGoods', queryData);
  },

  /**
   * お気に入り商品を検索
   * @param queryData - 検索パラメータ
   * @returns Promise<ApiResponse>
   */
  getMyCollect: (queryData: { pageNum: number; pageSize: number }) => {
    return apiClient.post('/goods/myCollect', queryData);
  },

  /**
   * 商品を削除
   * @param goodsId - 商品ID
   * @returns Promise<ApiResponse>
   */
  deleteGoods: (goodsId: number) => {
    return apiClient.delete(`/goods/delete?goodsId=${goodsId}`);
  },
  
  /**
   * 商品のページ分割検索
   * @param query - 検索キーワード
   * @param attrFilters - 属性フィルター条件
   * @param catId - カテゴリーID
   * @param pageNum - ページ番号
   * @param pageSize - 1ページのサイズ
   * @param minPrice - 最低価格
   * @param maxPrice - 最高価格
   * @param platforms - プラットフォームフィルター
   * @returns Promise<ApiResponse>
   */
  getGoodsPage: (
    query: string, 
    attrFilters: Record<string, string> | undefined, 
    catId: number | undefined, 
    pageNum: number, 
    pageSize: number,
    minPrice?: number,
    maxPrice?: number,
    platforms?: string[] | number[]
  ) => {
    // プラットフォームパラメータの型を処理
    const platformValues = platforms ? 
      platforms.map(p => typeof p === 'number' ? p.toString() : p) : 
      undefined;
    
    return apiClient.post('/goods/page', {
      query,
      attrFilters,
      catId,
      pageNum,
      pageSize,
      minPrice,
      maxPrice,
      platforms: platformValues
    });
  }
};

// 商品のいいね/お気に入り関連インターフェースは削除済み
/*
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
*/

// 投稿関連APIインターフェース
export const disclosureApi = {
  // 投稿を提出
  submit: (data: { title: string; content: string; images?: string[]; categoryId?: number }) => {
    return apiClient.post('/disclosure/submit', data);
  },
  
// 公開投稿リストを検索（上記で定義済み）
  
  // マイ投稿を検索
  queryMyList: (queryData: { pageNum: number; pageSize: number }) => {
    return apiClient.post('/disclosure/queryMyList', queryData);
  },
  
  // お気に入り投稿を検索
  queryMyCollection: (queryData: { pageNum: number; pageSize: number }) => {
    return apiClient.post('/disclosure/queryMyCollection', queryData);
  },
  
  // 投稿をお気に入りに追加
  collect: (disclosureId: number) => {
    return apiClient.post('/disclosure/collect', { disclosureId });
  },
  
  // 投稿のお気に入りを解除
  cancelCollect: (disclosureId: number) => {
    return apiClient.post('/disclosure/cancelCollect', { disclosureId });
  },
  
  // 投稿の詳細を取得
  getDetail: (disclosureId: number) => {
    return apiClient.get(`/disclosure/detail?disclosureId=${disclosureId}`);
  },
  
  // 投稿を削除
  delete: (disclosureId: number) => {
    return apiClient.post('/disclosure/delete', { disclosureId });
  },
  
  // 審査待ち投稿を取得
  getPendingDisclosure: (pageNum: number, pageSize: number) => {
    return apiClient.get(`/disclosure/pending?pageNum=${pageNum}&pageSize=${pageSize}`);
  },
  
  // 審査待ち投稿リストを検索（POSTメソッド）
  queryPendingList: (queryData: { pageNum: number; pageSize: number }) => {
    return apiClient.post('/disclosure/queryPendingList', queryData);
  },
  
  // 公開投稿を取得
  getPublicDisclosure: (pageNum: number, pageSize: number) => {
    return apiClient.get(`/disclosure/public?pageNum=${pageNum}&pageSize=${pageSize}`);
  },
  
  // 公開投稿リストを検索（POSTメソッド）
  queryPublicList: (queryData: { pageNum: number; pageSize: number }) => {
    return apiClient.post('/disclosure/queryPublicList', queryData);
  },
  
  // 投稿を審査
  review: (disclosureId: number, status: 'approved' | 'rejected', reason?: string) => {
    return apiClient.post('/disclosure/review', { disclosureId, status, reason });
  },
  
  // 審査操作（別名）
  audit: (disclosureId: number, status: 'approved' | 'rejected' | 1 | 2) => {
    // ステータス値を直接渡し、バックエンドで型変換を処理
    return apiClient.post('/disclosure/audit', { disclosureId, status: status });
  },
  
  // マイ投稿を取得
  getMyDisclosure: (pageNum: number, pageSize: number) => {
    return apiClient.get(`/disclosure/my?pageNum=${pageNum}&pageSize=${pageSize}`);
  },
  
  // 投稿を追加（別名）
  add: (data: { title: string; content: string; link?: string; images?: string[]; categoryId?: number; disclosurePrice?: number; imgUrl?: string }) => {
    return apiClient.post('/disclosure/add', data);
  }
};

// 通知相关API接口
export const notificationApi = {
  // 获取通知列表
  getList: (pageNum: number, pageSize: number) => {
    return apiClient.get(`/notification/list?pageNum=${pageNum}&pageSize=${pageSize}`);
  },
  
  // 获取我的通知（别名）
  getMyNotifications: () => {
    return apiClient.get('/notification/my');
  },
  
  // 标记通知为已读
  markAsRead: (notificationId: number) => {
    return apiClient.post('/notification/markAsRead', { notificationId });
  },
  
  // 标记所有通知为已读
  markAllAsRead: () => {
    return apiClient.post('/notification/markAllAsRead');
  },
  
  // 获取未读通知数量
  getUnreadCount: () => {
    return apiClient.get('/notification/unreadCount');
  },
  
  // 删除通知
  delete: (notificationId: number) => {
    return apiClient.post('/notification/delete', { notificationId });
  },
  
  // 通知を削除（別名）
  deleteNotification: (notificationId: number) => {
    return apiClient.post('/notification/delete', { notificationId });
  }
};

// カテゴリー関連APIインターフェース
export const categoryApi = {
  // カテゴリーリストを取得
  getList: () => {
    return apiClient.get('/category/list');
  },
  
  // カテゴリー属性を取得
  getAttributes: (catId: number) => {
    return apiClient.get(`/category/attributes?catId=${catId}`);
  }
};

// 一般的なAPIインターフェース
export const commonApi = {
  // ファイルをアップロード
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/common/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // ファイルをアップロード（別名）
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/common/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // システム設定を取得
  getConfig: () => {
    return apiClient.get('/common/config');
  }
};

export const commentApi = {
  add: (data: { disclosureId: number; content: string; parentId?: number }) => {
    return apiClient.post('/comment/addComment', data);
  },
  list: (disclosureId: number) => {
    return apiClient.post('/comment/queryComment', { disclosureId });
  },
  del: (commentId: number) => {
    return apiClient.post('/comment/delComment', { commentId });
  }
};

export default apiClient;
