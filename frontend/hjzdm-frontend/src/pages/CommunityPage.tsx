import React, { useState, useEffect } from 'react';
// 导入必要的React Router导航钩子
import { useNavigate } from 'react-router-dom';
// 导入API服务模块
import { disclosureApi, commentApi } from '../services/api';
// 导入页面样式文件
import './CommunityPage.css';

/**
 * 披露内容接口定义
 * 定义社区页面中每条披露内容的数据结构
 */
interface Disclosure {
  disclosureId: number;        // 披露内容唯一标识
  title: string;              // 披露标题
  content: string;            // 披露内容描述
  link: string;               // 商品链接
  disclosurePrice: number;    // 披露价格
  imgUrl?: string;            // 图片URL（可选）
  createTime: string;         // 创建时间
  authorName?: string;        // 作者名称（可选）
  likeCount?: number;         // 点赞数量（可选）
  collectCount?: number;      // 收藏数量（可选）
  likedByCurrentUser?: boolean; // 当前用户是否已点赞（可选）
}

/**
 * 评论接口定义
 * 定义评论数据结构
 */
interface Comment {
  id: number;                 // 评论唯一标识
  parentId?: number;          // 父评论ID（用于回复功能，可选）
  disclosureId: number;       // 关联的披露内容ID
  content: string;            // 评论内容
  createTime: string;         // 创建时间
  owner?: boolean;            // 是否为评论所有者（可选）
  avatarUrl?: string;         // 用户头像URL（可选）
  nickName?: string;          // 用户昵称（可选）
  hasLike?: boolean;          // 是否有点赞（可选）
  status: number;             // 评论状态
  publisher?: boolean;        // 是否为发布者（可选）
  likeCount?: number;         // 点赞数量（可选）
  likedByCurrentUser?: boolean; // 当前用户是否已点赞（可选）
}

/**
 * 社区页面核心组件
 * 实现用户浏览披露内容、点赞、收藏、评论等社交互动功能
 */
const CommunityPage: React.FC = () => {
  // 导航钩子，用于页面跳转
  const navigate = useNavigate();
  
  // 披露内容列表状态
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  
  // 页面加载状态
  const [loading, setLoading] = useState(true);
  
  // 评论映射状态，存储每个披露内容的评论列表
  const [commentMap, setCommentMap] = useState<Record<number, Comment[]>>({});
  
  // 评论输入框内容状态
  const [commentInput, setCommentInput] = useState<Record<number, string>>({});
  
  // 回复目标评论状态
  const [replyTo, setReplyTo] = useState<Record<number, Comment | null>>({});
  
  // 评论加载状态
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});
  
  /**
   * 图片URL转换函数
   * 根据不同的环境和URL格式，将相对路径转换为可访问的完整URL
   * @param url - 原始图片URL
   * @returns 转换后的完整图片URL
   */
  const convertImageUrl = (url: string): string => {
    // 如果URL为空或无效，返回默认占位符图片
    if (!url || url.trim() === '') {
      return '/images/placeholder.png';
    }
    
    // 处理以 /uploads/ 开头的相对路径
    if (url.startsWith('/uploads/')) {
      // 判断当前运行环境
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        // 开发环境：通过代理访问后端的/uploads/路径
        return url;
      } else {
        // 生产环境：使用固定的后端URL（硬编码方式避免环境变量依赖）
        const backendUrl = 'https://hjzdm-zx.onrender.com';
        return `${backendUrl}${url}`;
      }
    }
    
    // 处理完整的HTTP/HTTPS URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 处理其他相对路径情况
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      return url;
    } else {
      const backendUrl = 'https://hjzdm-zx.onrender.com';
      // 确保路径以/开头
      return `${backendUrl}${url.startsWith('/') ? url : '/' + url}`;
    }
  };
  
  /**
   * 点赞状态管理
   * 使用Set数据结构存储用户已点赞的披露内容ID，提高查找效率
   */
  // 点赞功能已删除
  
  /**
   * 点赞数量统计
   * 记录每个披露内容的点赞总数
   */
  // 点赞计数功能已删除
  
  /**
   * 收藏状态管理
   * 使用Set数据结构存储用户已收藏的披露内容ID
   */
  // 收藏功能已删除
  
  /**
   * 收藏数量统计
   * 记录每个披露内容的收藏总数
   */
  // 收藏計数機能已削除
  
  /**
   * 评论排序状态
   * 控制每个披露内容下评论的显示顺序（最新/最旧）
   */
  const [commentSortOrder, setCommentSortOrder] = useState<Record<number, 'latest' | 'oldest'>>({});
  
  /**
   * 评论显示数量控制
   * 限制初始显示的评论数量，提供"查看更多"功能
   */
  const [maxCommentsToShow, setMaxCommentsToShow] = useState(5);

  /**
   * 组件挂载时加载披露内容
   * 在组件初始化时自动获取社区披露内容列表
   */
  useEffect(() => {
    loadDisclosures();
  }, []);

  /**
   * 加载披露内容列表
   * 从后端API获取公开的披露内容并初始化组件状态
   * @async
   * @returns {Promise<void>}
   */
  const loadDisclosures = async () => {
    try {
      // 设置加载状态
      setLoading(true);
      
      // 调用API获取披露内容列表
      const res = await disclosureApi.queryPublicList({ pageNum: 1, pageSize: 100 });
      const disclosuresData = res.data.data || [];
      
      // 更新组件状态
      setDisclosures(disclosuresData);
      
      // 初始化状态已完成
      // 点赞和收藏機能已削除
      
    } catch (err) {
      // 错误处理：记录错误日志
      console.error('加载披露内容失败:', err);
    } finally {
      // 无论成功与否，都要结束加载状态
      setLoading(false);
    }
  };

  /**
   * 用户登录状态验证
   * 检查用户是否已登录，未登录则跳转到登录页面
   * @returns {boolean} 返回用户登录状态
   */
  const ensureLogin = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // 未登录，跳转到登录页面
      navigate('/login');
      return false;
    }
    return true;
  };

  /**
   * 加载指定披露内容的评论
   * @param disclosureId - 披露内容ID
   * @async
   * @returns {Promise<void>}
   */
  const loadComments = async (disclosureId: number) => {
    try {
      // 设置该披露内容的评论加载状态
      setCommentLoading(prev => ({ ...prev, [disclosureId]: true }));
      
      // 调用API获取评论列表
      const res = await commentApi.list(disclosureId);
      
      // 检查API响应状态
      if (res.data.code !== 200) {
        console.error('评论加载失败:', res.data.msg);
        // 加载失败时设置空数组
        setCommentMap(prev => ({ ...prev, [disclosureId]: [] }));
        return;
      }
      
      // 处理成功响应的数据
      const list: Comment[] = res.data.data || [];
      setCommentMap(prev => ({ ...prev, [disclosureId]: list }));
      
    } catch (e: any) {
      // 异常处理
      console.error('评论加载异常:', e);
      setCommentMap(prev => ({ ...prev, [disclosureId]: [] }));
      
      // 显示具体的错误情報
      if (e.response?.data?.msg) {
        console.error('评论加载失敗:', e.response.data.msg);
      }
      
    } finally {
      // 无论成功与否，都要結束加载状態
      setCommentLoading(prev => ({ ...prev, [disclosureId]: false }));
    }
  };

  /**
   * 评论模态框状态管理
   * 控制评论详情弹窗的显示与隐藏
   */
  const [modalComment, setModalComment] = useState<{disclosureId: number, item: Disclosure} | null>(null);
  
  /**
   * 入力ボックスフォーカス状態管理
   * コメント入力ボックスがフォーカスを得たときに全体レイアウトの調整を制御
   */
  const [isInputFocused, setIsInputFocused] = useState(false);

  /**
   * 切換コメント表示/非表示
   * 指定された披露内容のコメント詳細ポップアップを制御
   * @param disclosureId - 披露内容ID
   * @param item - 披露内容オブジェクト
   */
  const toggleComments = (disclosureId: number, item: Disclosure) => {
    // すでに該当の披露内容のコメントが開かれている場合は閉じる
    if (modalComment?.disclosureId === disclosureId) {
      setModalComment(null);
      return;
    }
    
    // 新しいコメントモーダルを開く
    setModalComment({ disclosureId, item });
    
    // まだ該当の披露内容のコメントが読み込まれていない場合はコメントデータを読み込む
    if (!commentMap[disclosureId]) {
      loadComments(disclosureId);
    }
  };

  /**
   * コメントの送信
   * ユーザーログイン状態の検証
   * @param disclosureId - 披露内容ID
   * @async
   * @returns {Promise<void>}
   */
  const handleSubmitComment = async (disclosureId: number) => {
    // ユーザーログイン状態の検証
    if (!ensureLogin()) return;
    
    // コメント内容の取得と検証
    const text = (commentInput[disclosureId] || '').trim();
    if (!text) {
      alert('コメント内容を入力してください');
      return;
    }
    if (text.length > 500) {
      alert('コメント内容は500文字以内で入力してください');
      return;
    }
    
    // 返信先の取得（コメントへの返信の場合）
    const replyTarget = replyTo[disclosureId];
    
    try {
      // APIにコメントを送信
      const res = await commentApi.add({
        disclosureId,
        content: text,
        parentId: replyTarget ? replyTarget.id : undefined
      });
      
      // APIレスポンスの処理
      if (res.data.code === 200) {
        // 送信成功、入力ボックスと返信状態をクリア
        setCommentInput(prev => ({ ...prev, [disclosureId]: '' }));
        setReplyTo(prev => ({ ...prev, [disclosureId]: null }));
        
        // 新しいコメントを表示するためにコメントリストを再読み込み
        await loadComments(disclosureId);
        
        // ここに他のUI更新ロジックを追加できる
        
      } else {
        // APIがエラーを返した場合
        alert(res.data.msg || 'コメントの送信に失敗しました');
      }
      
    } catch (e: any) {
      // 例外処理
      console.error('コメントの送信中にエラーが発生しました:', e);
      
      // 具体的なエラーメッセージを表示
      if (e.response?.data?.msg) {
        alert(e.response.data.msg);
      } else {
        alert('コメントの送信に失敗しました');
      }
    }
  };

  const handleDeleteComment = async (disclosureId: number, commentId: number) => {
    if (!ensureLogin()) return;
    if (!window.confirm('本当にこのコメントを削除しますか？')) {
      return;
    }
    try {
      const res = await commentApi.del(commentId);
      if (res.data.code !== 200) {
        alert(res.data.msg || 'コメントの削除に失敗しました');
      }
      // コメントリストを再読み込み
      loadComments(disclosureId);
    } catch (e: any) {
      console.error(e);
      if (e.response?.data?.msg) {
        alert(e.response.data.msg);
      } else {
        alert('コメントの削除に失敗しました');
      }
    }
  };

  // コメントソート切り替えを処理
  const handleSortToggle = (disclosureId: number) => {
    setCommentSortOrder(prev => ({
      ...prev,
      [disclosureId]: prev[disclosureId] === 'latest' ? 'oldest' : 'latest'
    }));
  };

  // ソートされたコメントリストを取得
  const getSortedComments = (disclosureId: number) => {
    const comments = commentMap[disclosureId] || [];
    const sortOrder = commentSortOrder[disclosureId] || 'latest';
    
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.createTime).getTime();
      const dateB = new Date(b.createTime).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
  };

  const handleReply = (disclosureId: number, comment: Comment) => {
    if (!ensureLogin()) return;
    setReplyTo(prev => ({ ...prev, [disclosureId]: comment }));
  };

  // 收藏状態読み込み機能は削除されました

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>読み込み中...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {disclosures.map((item) => (
            <div key={item.disclosureId} className="card" style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ height: '200px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.imgUrl ? (
                  <img 
                    src={convertImageUrl(item.imgUrl.includes(',') ? item.imgUrl.split(',')[0] : item.imgUrl)} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    onError={(e) => {
                      console.error('Image load failed:', (e.target as HTMLImageElement).src);
                      // 显示占位符而不是隐藏画像
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      // 親コンテナに占位符を追加
                      const parent = img.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#ccc;font-size:14px;">
                            🖼️ 画像なし
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5',
                    color: '#ccc',
                    fontSize: '14px'
                  }}>
                    🖼️ 画像なし
                  </div>
                )}
              </div>
              <div className="card-content" style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', lineHeight: '1.4', height: '44px', overflow: 'hidden' }}>{item.title}</h3>
                <div style={{ color: '#ff5000', fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>¥{item.disclosurePrice}</div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px', height: '60px', overflow: 'hidden' }}>{item.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#999' }}>{new Date(item.createTime).toLocaleDateString()}</span>
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      background: '#ff5000', 
                      color: '#fff', 
                      padding: '5px 15px', 
                      borderRadius: '15px', 
                      textDecoration: 'none', 
                      fontSize: '13px',
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={item.link}
                  >
                    詳細へ
                  </a>
                  <div className="interaction-buttons">
                    <button
                      className={`btn-interaction comment ${modalComment?.disclosureId === item.disclosureId ? 'comment-open' : ''}`}
                      onClick={() => toggleComments(item.disclosureId, item)}
                      title="コメント"
                    >
                      <img 
                        src="/images/pinglun.png" 
                        alt="comment" 
                        className="comment-icon"
                        onError={(e) => {
                          // 图片加载失败时の処理
                          const img = e.target as HTMLImageElement;
                          console.warn('コメント画像読み込み失敗:', img.src);
                          img.style.display = 'none';
                          img.parentElement!.innerHTML = '💬';
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* コメントモーダル */}
      {modalComment && (
        <div className="comment-modal-overlay" onClick={() => setModalComment(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          {/* 独立の閉じるボタン，確保不会被遮挡 */}
          <button 
            className="modal-close-btn-floating"
            onClick={() => setModalComment(null)}
            title="閉じる"
            style={{ 
              position: 'fixed', 
              top: '20px', 
              right: '20px', 
              background: 'rgba(255, 255, 255, 0.9)', 
              border: '2px solid #fff', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#666', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              transition: 'all 0.3s ease', 
              zIndex: 1105,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            ×
          </button>
          <div className="comment-modal" onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)', animation: 'modalSlideIn 0.3s ease-out', position: 'relative', zIndex: 1101 }}>
            <div className="comment-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111' }}>コメント</h3>
              {/* 原来的閉じるボタン保持但降低優先度 */}
              <button 
                className="modal-close-btn"
                onClick={() => setModalComment(null)}
                title="閉じる"
                style={{ background: '#f0f0f0', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '20px', fontWeight: 'bold', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
              >
                ×
              </button>
            </div>
            <div className="comment-modal-content" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* 現在の投稿情報を表示 */}
              <div className="modal-disclosure-preview" style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {modalComment.item.imgUrl ? (
                      <img 
                        src={convertImageUrl(modalComment.item.imgUrl.includes(',') ? modalComment.item.imgUrl.split(',')[0] : modalComment.item.imgUrl)} 
                        alt={modalComment.item.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          console.error('Modal image load failed:', (e.target as HTMLImageElement).src);
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#ccc;font-size:12px;">
                                🖼️ 画像なし
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f5f5f5',
                        color: '#ccc',
                        fontSize: '12px'
                      }}>
                        🖼️ 画像なし
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '16px', lineHeight: '1.4' }}>{modalComment.item.title}</h4>
                    <div style={{ color: '#ff5000', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>¥{modalComment.item.disclosurePrice}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{new Date(modalComment.item.createTime).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              {/* コメントエリア */}
              <div className="comment-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
                <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    コメント
                    {(commentMap[modalComment.disclosureId] || []).length > 0 && (
                      <span className="comment-badge">{(commentMap[modalComment.disclosureId] || []).length}</span>
                    )}
                  </div>
                  {/* ソートボタン */}
                  {(commentMap[modalComment.disclosureId] || []).length > 1 && (
                    <button
                      onClick={() => handleSortToggle(modalComment.disclosureId)}
                      className="sort-toggle-btn"
                      title={commentSortOrder[modalComment.disclosureId] === 'latest' ? '古い順に表示' : '新しい順に表示'}
                    >
                      {commentSortOrder[modalComment.disclosureId] === 'latest' ? '最新' : '最古'}
                    </button>
                  )}
                </div>
                
                {commentLoading[modalComment.disclosureId] ? (
                  <div className="comment-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '32px' }}>
                    <div className="comment-loading-dot" style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '50%', animation: 'bounce 1.5s infinite ease-in-out' }}></div>
                    <div className="comment-loading-dot" style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '50%', animation: 'bounce 1.5s infinite ease-in-out', animationDelay: '0.2s' }}></div>
                    <div className="comment-loading-dot" style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '50%', animation: 'bounce 1.5s infinite ease-in-out', animationDelay: '0.4s' }}></div>
                  </div>
                ) : (commentMap[modalComment.disclosureId] || []).length === 0 ? (
                  <div style={{ fontSize: '14px', color: '#999', padding: '20px 0', textAlign: 'center', fontStyle: 'italic' }}>
                    コメントはまだありません。最初のコメントをどうぞ！
                  </div>
                ) : (
                  <div className="comment-list-container" style={{ flex: 1, overflowY: 'auto', padding: '0 24px', margin: '16px 0', maxHeight: '280px' }}>
                    {(getSortedComments(modalComment.disclosureId) || []).slice(0, maxCommentsToShow).map((c) => {
                      const commentsForDisclosure = getSortedComments(modalComment.disclosureId) || [];
                      const parent = c.parentId ? commentsForDisclosure.find(p => p.id === c.parentId) : undefined;
                      const isReply = !!parent;
                      return (
                        <div
                          key={c.id}
                          className={isReply ? 'comment-reply' : ''}
                          style={{ marginLeft: isReply ? 0 : 'unset', position: 'relative' }}
                        >
                          <div className={`comment-bubble ${c.owner ? 'comment-owner' : ''}`} style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '8px 16px', marginBottom: 0, position: 'relative', lineHeight: '1.3' }}>
                            <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
                              <span className={`comment-author ${c.publisher ? 'publisher' : ''}`} style={{ fontWeight: 600, color: '#111', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {c.nickName || '匿名'}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="comment-time" style={{ fontSize: '11px', color: '#aaa', background: 'transparent', padding: 0, borderRadius: 0 }}>
                                  {new Date(c.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <div style={{ fontSize: '13px', marginBottom: '4px', lineHeight: '1.3' }}>
                              {isReply && parent ? (
                                <span style={{ color: '#666', marginRight: '4px', fontWeight: '500' }}>
                                  返信 @{parent.nickName || '匿名'}:
                                </span>
                              ) : null}
                              <span style={{ wordBreak: 'break-word' }}>{c.content}</span>
                            </div>
                            <div className="comment-actions" style={{ display: 'flex', gap: '12px', marginTop: '2px', paddingTop: 0, borderTop: 'none' }}>
                              <button
                                type="button"
                                onClick={() => handleReply(modalComment.disclosureId, c)}
                                className="comment-action-btn reply-btn"
                                title="返信"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', padding: '4px 0', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', color: '#666' }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, width: '16px', height: '16px' }}>
                                  <path d="M9 11L13 7L17 11" stroke="#3498db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M13 7V17" stroke="#3498db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                返信
                              </button>
                              {c.owner && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(modalComment.disclosureId, c.id)}
                                  className="comment-action-btn"
                                  title="削除"
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', padding: '4px 0', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', color: '#666' }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, width: '16px', height: '16px' }}>
                                    <path d="M4 7H20" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10 11V17" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 11V17" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  削除
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {/* 显示更多ボタン */}
                    {(getSortedComments(modalComment.disclosureId) || []).length > maxCommentsToShow && (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <button
                          onClick={() => setMaxCommentsToShow(prev => prev + 5)}
                          className="load-more-comments-btn"
                          style={{ background: 'transparent', color: '#6366f1', border: '1px solid #6366f1', padding: '6px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >
                          もっと見る ({(getSortedComments(modalComment.disclosureId) || []).length - maxCommentsToShow}件)
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`comment-input-container ${isInputFocused ? 'input-focused' : ''}`} style={{ marginTop: '16px', paddingTop: '16px', paddingBottom: '16px', borderTop: '1px solid #f0f0f0', background: '#fafafa', flexShrink: 0, boxSizing: 'border-box', minHeight: 'auto' }}>
                  {replyTo[modalComment.disclosureId] && (
                    <div className="reply-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '6px 0', background: 'transparent', borderRadius: 0, fontSize: '12px', color: '#6366f1', fontWeight: 500 }}>
                      返信先: {replyTo[modalComment.disclosureId]?.nickName || '匿名'}
                      <button
                        type="button"
                        onClick={() => setReplyTo(prev => ({ ...prev, [modalComment.disclosureId]: null }))}
                        className="reply-cancel-btn"
                        style={{ background: 'transparent', color: '#666', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        キャンセル
                      </button>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      value={commentInput[modalComment.disclosureId] || ''}
                      onChange={e => setCommentInput(prev => ({ ...prev, [modalComment.disclosureId]: e.target.value }))}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder={replyTo[modalComment.disclosureId] ? `返信 @${replyTo[modalComment.disclosureId]?.nickName || '匿名'}...` : "コメントを入力..."}
                      className="comment-input"
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '24px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        minHeight: '40px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSubmitComment(modalComment.disclosureId)}
                      className="comment-submit-btn-mini"
                      style={{
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '24px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        minHeight: '40px',
                      }}
                    >
                      投稿
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
