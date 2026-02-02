import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { disclosureApi, disclosureOperateApi, commentApi } from '../services/api';
import './CommunityPage.css';

interface Disclosure {
  disclosureId: number;
  title: string;
  content: string;
  link: string;
  disclosurePrice: number;
  imgUrl?: string;
  createTime: string;
  authorName?: string;
  likeCount?: number;
  collectCount?: number;
  likedByCurrentUser?: boolean;
}

interface Comment {
  id: number;
  parentId?: number;
  disclosureId: number;
  content: string;
  createTime: string;
  owner?: boolean;
  avatarUrl?: string;
  nickName?: string;
  hasLike?: boolean;
  status: number;
  publisher?: boolean;
  likeCount?: number;
  likedByCurrentUser?: boolean;
}

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentMap, setCommentMap] = useState<Record<number, Comment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<number, string>>({});
  const [replyTo, setReplyTo] = useState<Record<number, Comment | null>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});
  
  // いいね状態
  const [likedDisclosures, setLikedDisclosures] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  
  // お気に入り状態
  const [collectedDisclosures, setCollectedDisclosures] = useState<Set<number>>(new Set());
  const [collectCounts, setCollectCounts] = useState<Record<number, number>>({});
  
  // コメントソート状態
  const [commentSortOrder, setCommentSortOrder] = useState<Record<number, 'latest' | 'oldest'>>({});
  
  // コメントエリアの高さ固定関連状態
  const [maxCommentsToShow, setMaxCommentsToShow] = useState(5);

  useEffect(() => {
    loadDisclosures();
  }, []);

  const loadDisclosures = async () => {
    try {
      setLoading(true);
      const res = await disclosureApi.getPublicDisclosure(1, 100);
      const disclosuresData = res.data.data || [];
      
      // いいね状態とカウントを初期化
      const initialLikedSet = new Set<number>();
      const initialLikeCounts: Record<number, number> = {};
      const initialCollectCounts: Record<number, number> = {};
      
      disclosuresData.forEach((item: Disclosure) => {
        if (item.likedByCurrentUser) {
          initialLikedSet.add(item.disclosureId);
        }
        initialLikeCounts[item.disclosureId] = item.likeCount || 0;
        initialCollectCounts[item.disclosureId] = item.collectCount || 0;
      });
      
      setDisclosures(disclosuresData);
      setLikedDisclosures(initialLikedSet);
      setLikeCounts(initialLikeCounts);
      setCollectCounts(initialCollectCounts);
      
      // 加载用户的收藏状态
      await loadInitialCollectStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ensureLogin = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const loadComments = async (disclosureId: number) => {
    try {
      setCommentLoading(prev => ({ ...prev, [disclosureId]: true }));
      const res = await commentApi.list(disclosureId);
      if (res.data.code !== 200) {
        console.error('コメントの読み込みに失敗しました:', res.data.msg);
        setCommentMap(prev => ({ ...prev, [disclosureId]: [] }));
        return;
      }
      const list: Comment[] = res.data.data || [];
      setCommentMap(prev => ({ ...prev, [disclosureId]: list }));
    } catch (e: any) {
      console.error(e);
      setCommentMap(prev => ({ ...prev, [disclosureId]: [] }));
      if (e.response?.data?.msg) {
        console.error('コメントの読み込みに失敗しました:', e.response.data.msg);
      }
    } finally {
      setCommentLoading(prev => ({ ...prev, [disclosureId]: false }));
    }
  };

  // モーダル表示を制御
  const [modalComment, setModalComment] = useState<{disclosureId: number, item: Disclosure} | null>(null);
  
  // 入力フィールドのフォーカス状態を制御
  const [isInputFocused, setIsInputFocused] = useState(false);

  const toggleComments = (disclosureId: number, item: Disclosure) => {
    // すでに開いている場合は閉じる
    if (modalComment?.disclosureId === disclosureId) {
      setModalComment(null);
      return;
    }
    
    // 新しいコメントモーダルを開く
    setModalComment({ disclosureId, item });
    
    // コメントデータを読み込む
    if (!commentMap[disclosureId]) {
      loadComments(disclosureId);
    }
  };

  const handleSubmitComment = async (disclosureId: number) => {
    if (!ensureLogin()) return;
    const text = (commentInput[disclosureId] || '').trim();
    if (!text) {
      alert('コメントを入力してください');
      return;
    }
    if (text.length > 500) {
      alert('コメントは500文字以内で入力してください');
      return;
    }
    const replyTarget = replyTo[disclosureId];
    try {
      const res = await commentApi.add({
        disclosureId,
        content: text,
        parentId: replyTarget ? replyTarget.id : undefined
      });
      
      if (res.data.code === 200) {
        setCommentInput(prev => ({ ...prev, [disclosureId]: '' }));
        setReplyTo(prev => ({ ...prev, [disclosureId]: null }));
        // コメントリストを強制的に再読み込み
        await loadComments(disclosureId);
        
        // コメント追加後のUI更新
        console.log('コメント投稿成功');
      } else {
        alert(res.data.msg || 'コメントの投稿に失敗しました');
      }
    } catch (e: any) {
      console.error(e);
      if (e.response?.data?.msg) {
        alert(e.response.data.msg);
      } else {
        alert('コメントの投稿に失敗しました');
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

  const loadInitialCollectStatus = async () => {
    // 如果用户已登录，获取用户的收藏状态
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      console.log('开始加载收藏状态...');
      // 获取用户收藏的爆料列表
      const res = await disclosureApi.getMyCollect(1, 100);
      console.log('收藏API响应:', res);
      if (res.data.code === 200) {
        const collectedList = res.data.data?.records || res.data.data || [];
        console.log('收藏列表原始数据:', collectedList);
        const collectedIds = new Set<number>(collectedList.map((item: any) => item.disclosureId || item.id));
        setCollectedDisclosures(collectedIds);
        console.log('加载收藏状态成功，已收藏:', collectedIds.size, '个项目');
        console.log('收藏的ID列表:', Array.from(collectedIds));
      } else {
        console.error('获取收藏状态失败:', res.data.message);
      }
    } catch (err) {
      console.error('获取收藏状态失败:', err);
    }
  };

  const handleLike = async (item: Disclosure) => {
    if (!ensureLogin()) return;
    
    const isLiked = likedDisclosures.has(item.disclosureId);
    const currentCount = likeCounts[item.disclosureId] || 0;
    
    try {
      // 先更新UI状态，提供即时反馈
      setLikedDisclosures(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(item.disclosureId);
        } else {
          newSet.add(item.disclosureId);
        }
        return newSet;
      });
      
      // 更新点赞数量
      const newCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
      setLikeCounts(prev => ({
        ...prev,
        [item.disclosureId]: newCount
      }));
      
      // 调用API更新服务器状态
      const res = isLiked 
        ? await disclosureOperateApi.unlike(item.disclosureId)
        : await disclosureOperateApi.like(item.disclosureId);
      
      if (res.data.code !== 200) {
        throw new Error(res.data.message || '操作失败');
      }
      
      console.log(`${isLiked ? '取消点赞' : '点赞'}成功:`, item.disclosureId);
      
      // 成功后重新加载数据以确保服务器状态一致
      await loadDisclosures();
      
    } catch (err: any) {
      // 错误处理：回滚UI状态
      console.error('点赞操作失败:', err);
      
      setLikedDisclosures(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(item.disclosureId);
        } else {
          newSet.delete(item.disclosureId);
        }
        return newSet;
      });
      
      setLikeCounts(prev => ({
        ...prev,
        [item.disclosureId]: currentCount
      }));
      
      const errorMessage = err.response?.data?.message || err.message || '操作失败，请重试';
      alert(errorMessage);
    }
  };

  const handleCollect = async (item: Disclosure) => {
    if (!ensureLogin()) return;
    
    const isCollected = collectedDisclosures.has(item.disclosureId);
    
    try {
      // 先更新UI状态，提供即时反馈
      setCollectedDisclosures(prev => {
        const newSet = new Set(prev);
        if (isCollected) {
          newSet.delete(item.disclosureId);
        } else {
          newSet.add(item.disclosureId);
        }
        return newSet;
      });
      
      // 更新收藏数量
      setCollectCounts(prev => ({
        ...prev,
        [item.disclosureId]: isCollected 
          ? Math.max(0, (prev[item.disclosureId] || 0) - 1)
          : (prev[item.disclosureId] || 0) + 1
      }));
      
      // 调用API更新服务器状态
      const res = isCollected 
        ? await disclosureOperateApi.uncollect(item.disclosureId)
        : await disclosureOperateApi.collect(item.disclosureId);
      
      if (res.data.code !== 200) {
        // 如果API调用失败，回滚UI状态
        setCollectedDisclosures(prev => {
          const newSet = new Set(prev);
          if (isCollected) {
            newSet.add(item.disclosureId);
          } else {
            newSet.delete(item.disclosureId);
          }
          return newSet;
        });
        
        // 回滚收藏数量
        setCollectCounts(prev => ({
          ...prev,
          [item.disclosureId]: isCollected 
            ? (prev[item.disclosureId] || 0) + 1
            : Math.max(0, (prev[item.disclosureId] || 0) - 1)
        }));
        
        console.error('收藏操作失败:', res.data.message);
        alert('操作失败，请重试');
      } else {
        console.log(`${isCollected ? '取消收藏' : '收藏'}成功:`, item.disclosureId);
        // 成功后强制刷新数据，确保显示正确
        setTimeout(() => {
          loadDisclosures();
        }, 100);
      }
    } catch (err) {
      // 网络错误处理
      console.error('收藏操作网络错误:', err);
      
      // 回滚UI状态
      setCollectedDisclosures(prev => {
        const newSet = new Set(prev);
        if (isCollected) {
          newSet.add(item.disclosureId);
        } else {
          newSet.delete(item.disclosureId);
        }
        return newSet;
      });
      
      // 回滚收藏数量
      setCollectCounts(prev => ({
        ...prev,
        [item.disclosureId]: isCollected 
          ? (prev[item.disclosureId] || 0) + 1
          : Math.max(0, (prev[item.disclosureId] || 0) - 1)
      }));
      
      alert('网络错误，请检查连接后重试');
    }
  };

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
                    src={item.imgUrl.includes(',') ? item.imgUrl.split(',')[0] : item.imgUrl} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    onError={(e) => {
                      console.error('Image load failed:', (e.target as HTMLImageElement).src);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span style={{ color: '#ccc' }}>No Image</span>
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
                      className={`btn-interaction like ${likedDisclosures.has(item.disclosureId) ? 'liked' : ''}`}
                      onClick={() => handleLike(item)}
                      title="いいね"
                    >
                      <img 
                        src={`/images/${likedDisclosures.has(item.disclosureId) ? 'yidianzan' : 'dianzan'}.png`} 
                        alt="like" 
                        className="like-icon"
                      />
                      {likeCounts[item.disclosureId] > 0 && (
                        <span className="like-count">{likeCounts[item.disclosureId]}</span>
                      )}
                    </button>
                    <button 
                      className={`btn-interaction collect ${collectedDisclosures.has(item.disclosureId) ? 'collected' : ''}`}
                      onClick={() => handleCollect(item)}
                      title="お気に入り"
                    >
                      <img 
                        src={`/images/${collectedDisclosures.has(item.disclosureId) ? 'yishoucang' : 'shoucang'}.png`} 
                        alt="collect" 
                        className="collect-icon"
                      />
                      {collectCounts[item.disclosureId] > 0 && (
                        <span className="collect-count">{collectCounts[item.disclosureId]}</span>
                      )}
                    </button>
                    <button
                      className={`btn-interaction comment ${modalComment?.disclosureId === item.disclosureId ? 'comment-open' : ''}`}
                      onClick={() => toggleComments(item.disclosureId, item)}
                      title="コメント"
                    >
                      <img 
                        src="/images/pinglun.png" 
                        alt="comment" 
                        className="comment-icon"
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
          {/* 独立的关闭按钮，确保不会被遮挡 */}
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
              {/* 原来的关闭按钮保持但降低优先级 */}
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
                        src={modalComment.item.imgUrl.includes(',') ? modalComment.item.imgUrl.split(',')[0] : modalComment.item.imgUrl} 
                        alt={modalComment.item.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ color: '#ccc', fontSize: '12px' }}>No Image</span>
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
