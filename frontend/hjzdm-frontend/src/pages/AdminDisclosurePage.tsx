import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { disclosureApi } from '../services/api';
import './AdminDisclosurePage.css';

interface Disclosure {
  disclosureId: number;
  title: string;
  content: string;
  link: string;
  disclosurePrice: number;
  imgUrl?: string;
  createTime: string;
  status: number;
  author?: number;
}

const AdminDisclosurePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'public'>('pending');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Disclosure[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<Record<number, string>>({}); // State to track selected image per item
  const [retryCount, setRetryCount] = useState(0); // 重试计数

  // 添加图片URL转换函数
  const convertImageUrl = (url: string): string => {
    // 如果URL为空或无效，返回空字符串
    if (!url) return '';
    
    // 如果是相对路径且以 /uploads/ 开頭，则转换为完整的后端URL
    if (url.startsWith('/uploads/')) {
      // 在开发环境中，使用代理地址；在生产环境中使用绝对URL
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        // 开発環境：通過代理アクセス後端の/uploads/パス
        return url;
      } else {
        // 生産環境：使用完整的後端URL
        return `http://localhost:9090${url}`;
      }
    }
    
    // 如果是完整的URL（包含http/https），直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 其他情况（相对路径但不是/uploads/开头）也使用后端地址
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      return url;
    } else {
      return `http://localhost:9090${url.startsWith('/') ? url : '/' + url}`;
    }
  };

  const isAdmin = (() => {
    const token = localStorage.getItem('token');
    console.log('AdminDisclosurePage: token=', token);
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return false;
      const payload = JSON.parse(atob(parts[1]));
      console.log('AdminDisclosurePage: admin payload', payload);
      const userId = payload?.userId ?? payload?.id;
      const roles = payload?.roles ?? payload?.role ?? [];
      const hasAdminRole = Array.isArray(roles) ? roles.includes('admin') : (roles === 'admin');
      // Check for admin by id, or admin role, or explicit username
      return userId === 1 || hasAdminRole || payload?.username === 'admin' || payload?.name === 'admin';
    } catch {
      return false;
    }
  })();

  // 将后端可能返回的披露对象映射为本页使用的 Disclosure 接口
  const normalizeDisclosure = (d: any): Disclosure => {
    return {
      disclosureId: d.disclosureId ?? d.id ?? 0,
      title: d.title ?? '',
      content: d.content ?? '',
      link: d.link ?? '',
      disclosurePrice: d.disclosurePrice ?? d.price ?? 0,
      imgUrl: d.imgUrl ?? d.imageUrl ?? '',
      createTime: d.createTime ?? '',
      status: d.status ?? 0,
      author: d.author
    };
  };

  const load = useCallback(async (attemptRetry = true) => {
    console.log('AdminDisclosurePage: load start, activeTab=', activeTab, 'retryCount=', retryCount);
    try {
      setLoading(true);
      setError(null);
      let res;
      
      // 添加超时处理
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时，请检查网络连接')), 25000)
      );
      
      if (activeTab === 'pending') {
        const requestPromise = disclosureApi.queryPendingList({ pageNum: 1, pageSize: 100 });
        res = await Promise.race([requestPromise, timeoutPromise]);
        console.log('AdminDisclosurePage: pendingList response', (res as any)?.data);
      } else if (activeTab === 'public') {
        const requestPromise = disclosureApi.queryPublicList({ pageNum: 1, pageSize: 100 });
        res = await Promise.race([requestPromise, timeoutPromise]);
        console.log('AdminDisclosurePage: publicList response', (res as any)?.data);
      } else {
        // 获取所有投稿 - 并行请求提高效率
        const [pendingRes, publicRes] = await Promise.all([
          disclosureApi.queryPendingList({ pageNum: 1, pageSize: 50 }),
          disclosureApi.queryPublicList({ pageNum: 1, pageSize: 50 })
        ]);
        res = {
          data: {
            data: [...(pendingRes.data?.data || []), ...(publicRes.data?.data || [])]
          }
        };
        console.log('AdminDisclosurePage: all-merge counts -> pending:', pendingRes?.data?.data?.length, 'public:', publicRes?.data?.data?.length);
      }
      
      let rawList: any[] = [];
      if (res && (res as any).data) {
        // 后端返回的是 Result 对象: { code: 200, data: [...] }
        // 所以实际数据在 res.data
        rawList = Array.isArray((res as any).data) ? (res as any).data : [];
        // 如果 res.data 是对象且包含 data 属性，使用 res.data.data
        if (typeof (res as any).data === 'object' && (res as any).data !== null && (res as any).data.data !== undefined) {
          rawList = Array.isArray((res as any).data.data) ? (res as any).data.data : [];
        }
      }
      const list = rawList.map(normalizeDisclosure);
      setItems(list);
      console.log('AdminDisclosurePage: load result count=', list.length, 'tab=', activeTab);
      setRetryCount(0); // 重置重试计数
    } catch (e: any) {
      console.error('AdminDisclosurePage: load error', e);
      let errorMessage = 'データの読み込みに失敗しました。';
      
      // 更详细的错误处理
      if (e.message && e.message.includes('超时')) {
        errorMessage = 'タイムアウトしました。ネットワーク接続を確認してください。';
        // 自动重试逻辑
        if (attemptRetry && retryCount < 2) {
          console.log(`自动重试第${retryCount + 1}次...`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => load(false), 3000); // 3秒后重试
          return;
        }
      } else if (e?.response?.status === 401) {
        errorMessage = '認証に失敗しました。再度ログインしてください。';
        // 自动跳转到登录页面
        localStorage.removeItem('token');
        navigate('/login');
        return;
      } else if (e?.response?.status === 500) {
        errorMessage = 'サーバーエラーが発生しました。しばらくしてから再度お試しください。';
      } else if (e?.response?.status === 404) {
        errorMessage = 'APIエンドポイントが見つかりません。システム管理者に連絡してください。';
      } else {
        errorMessage = e?.response?.data?.msg || e?.response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activeTab, retryCount, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate('/profile', { replace: true });
      return;
    }
    load();
  }, [isAdmin, navigate, activeTab]);

  const audit = async (disclosureId: number, status: 1 | 2) => {
    try {
      setSubmittingId(disclosureId);
      await disclosureApi.audit(disclosureId, status);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.msg || e?.response?.data?.message || '操作に失敗しました。');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async (disclosureId: number) => {
    if (!window.confirm('本当に削除しますか？この操作は取り消せません。')) {
      return;
    }
    try {
      setSubmittingId(disclosureId);
      await disclosureApi.delete(disclosureId);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.msg || e?.response?.data?.message || '削除に失敗しました。');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="admin-disclosure-container">
      <div className="profile-layout">
        <div className="main-content">
          {/* 管理员页面头部 - 类似个人页面的用户信息栏 */}
          <div className="admin-user-header">
            <div className="admin-avatar-section">
              <div className="admin-avatar-placeholder">
                <span className="admin-avatar-initials">🛡️</span>
              </div>
            </div>
            
            <div className="admin-info-section">
              <div className="admin-main-info">
                <h1 className="admin-display-name">
                  投稿審査パネル
                </h1>
                <div className="admin-meta">
                  <span className="meta-item">管理者専用</span>
                  <span className="meta-item">コンテンツ監査</span>
                </div>
              </div>
              
              <div className="admin-actions">
                <button
                  onClick={() => navigate('/community')}
                  className="action-button"
                >
                  コミュニティへ
                </button>
                <button
                  onClick={() => load()}
                  disabled={loading}
                  className={`action-button refresh-button ${loading ? 'disabled' : ''}`}
                >
                  {loading ? '読み込み中...' : '更新'}
                </button>
              </div>
            </div>
          </div>

          {/* 统一审查面板 - 状態タグと内容一体化 */}
          <div className="unified-review-panel">
            {/* 状態タグ栏 */}
            <div className="status-tabs">
              <button 
                onClick={() => setActiveTab('all')}
                className={`status-tab ${activeTab === 'all' ? 'active' : ''}`}
              >
                <span className="tab-icon">🏠</span>
                全ての投稿 ({items.length})
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`status-tab ${activeTab === 'pending' ? 'active' : ''}`}
              >
                <span className="tab-icon">⏳</span>
                未承認 ({items.filter(item => item.status === 0).length})
              </button>
              <button 
                onClick={() => setActiveTab('public')}
                className={`status-tab ${activeTab === 'public' ? 'active' : ''}`}
              >
                <span className="tab-icon">✅</span>
                公開済み ({items.filter(item => item.status === 1).length})
              </button>
            </div>
            
            {/* 分割線 */}
            <div className="content-divider"></div>
            
            {/* 内容区域 */}
            <div className="review-content">
              {error && (
                <div className="error-alert">
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="loading-container">読み込み中...</div>
              ) : items.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    {activeTab === 'all' ? '📭' : 
                     activeTab === 'pending' ? '⏳' : 
                     '✅'}
                  </div>
                  <h3>{activeTab === 'all' ? '投稿がありません' : 
                       activeTab === 'pending' ? '審査待ちの投稿はありません' : 
                       '公開済みの投稿はありません'}</h3>
                  <p>
                    {activeTab === 'all' ? '現在、システムには投稿が登録されていません。' : 
                     activeTab === 'pending' ? '新しい投稿が届くまでしばらくお待ちください。ユーザーからの投稿を確認できます。' : 
                     'まだ公開された投稿がありません。'}
                  </p>
                  <button 
                    onClick={() => load()} 
                    className="refresh-empty-button"
                    disabled={loading}
                  >
                    {loading ? '更新中...' : '再読み込み'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.filter(item => 
                    activeTab === 'all' || 
                    (activeTab === 'pending' && item.status === 0) || 
                    (activeTab === 'public' && item.status === 1)
                  ).map((it) => {
                    const isExpanded = expandedId === it.disclosureId;
                    return (
                      <div key={it.disclosureId} style={{ border: '1px solid #eee', borderRadius: 6, background: '#fff', overflow: 'hidden' }}>
                        {/* Summary Row */}
                        <div 
                          onClick={() => setExpandedId(prev => prev === it.disclosureId ? null : it.disclosureId)}
                          style={{ 
                            padding: '12px 15px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            cursor: 'pointer', 
                            background: isExpanded ? '#fafafa' : '#fff',
                            transition: 'background 0.2s'
                          }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 120px', alignItems: 'center', gap: 15, flex: 1, marginRight: 20 }}>
                            <span style={{ color: '#999', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{it.disclosureId}</span>
                            <span style={{ fontWeight: 700, fontSize: 15, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={it.title}>
                              {it.title}
                            </span>
                            <span style={{ color: '#ff4400', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>¥{it.disclosurePrice}</span>
                            <span style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new Date(it.createTime).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            {isExpanded ? '▲ 閉じる' : '▼ 詳細・審査'}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div style={{ borderTop: '1px solid #eee', padding: 20, animation: 'fadeIn 0.3s' }}>
                            {/* Debug info */}
                            <div style={{ marginBottom: 10, padding: 10, background: '#f0f8ff', borderRadius: 4, fontSize: 12 }}>
                              Debug: disclosureId={it.disclosureId}, status={it.status}
                            </div>
                            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                              {/* Image Gallery */}
                              <div style={{ width: 240, flexShrink: 0 }}>
                                {/* Main Image */}
                                <div style={{ width: '100%', height: 240, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', marginBottom: 10 }}>
                                  {it.imgUrl ? (
                                    <img
                                      src={selectedImages[it.disclosureId] || (it.imgUrl.includes(',') ? it.imgUrl.split(',')[0] : it.imgUrl)}
                                      alt={it.title}
                                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                      onError={(e) => { 
                                          console.error('Image load failed:', (e.target as HTMLImageElement).src);
                                          (e.target as HTMLImageElement).style.display = 'none'; 
                                      }}
                                    />
                                  ) : (
                                    <span style={{ color: '#ccc' }}>No Image</span>
                                  )}
                                </div>
                                
                                {/* Thumbnail List */}
                                {it.imgUrl && (
                                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                                    {(it.imgUrl.includes(',') ? it.imgUrl.split(',') : [it.imgUrl]).map((url, idx) => (
                                      <div 
                                        key={idx}
                                        onClick={() => setSelectedImages(prev => ({ ...prev, [it.disclosureId]: url }))}
                                        style={{ 
                                          width: 50, 
                                          height: 50, 
                                          border: (selectedImages[it.disclosureId] || (it.imgUrl?.includes(',') ? it.imgUrl?.split(',')[0] : it.imgUrl)) === url ? '2px solid #ff4400' : '1px solid #eee', 
                                          borderRadius: 4, 
                                          overflow: 'hidden', 
                                          cursor: 'pointer',
                                          flexShrink: 0
                                        }}
                                      >
                                        <img 
                                          src={convertImageUrl(url)} 
                                          alt={`thumb-${idx}`} 
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                          onError={(e) => {
                                            console.error('Thumbnail load failed:', (e.target as HTMLImageElement).src);
                                            const img = e.target as HTMLImageElement;
                                            img.style.display = 'none';
                                            const parent = img.parentElement;
                                            if (parent) {
                                              parent.innerHTML = `
                                                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0;color:#ccc;font-size:10px;">
                                                  🖼️
                                                </div>
                                              `;
                                            }
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Details */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 18, wordBreak: 'break-all' }}>{it.title}</h3>
                                <div style={{ marginBottom: 15, color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto', padding: '10px', background: '#fafafa', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                                  {it.content}
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                  <span style={{ fontWeight: 'bold', marginRight: 10 }}>リンク:</span>
                                  <a href={it.link} target="_blank" rel="noreferrer" style={{ color: '#1677ff', wordBreak: 'break-all' }}>
                                    {it.link}
                                  </a>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 15, marginTop: 20, borderTop: '1px dashed #eee', paddingTop: 20 }}>
                                  {activeTab === 'pending' ? (
                                    <>
                                      <button
                                        onClick={() => audit(it.disclosureId, 1)}
                                        disabled={submittingId === it.disclosureId}
                                        style={{ 
                                          border: '1px solid #b7eb8f', 
                                          background: '#f6ffed', 
                                          color: '#389e0d',
                                          padding: '8px 24px', 
                                          borderRadius: 4,
                                          cursor: submittingId === it.disclosureId ? 'not-allowed' : 'pointer',
                                          fontWeight: 'bold'
                                        }}
                                      >
                                        承認
                                      </button>
                                      <button
                                        onClick={() => audit(it.disclosureId, 2)}
                                        disabled={submittingId === it.disclosureId}
                                        style={{ 
                                          border: '1px solid #ffccc7', 
                                          background: '#fff2f0', 
                                          color: '#cf1322',
                                          padding: '8px 24px', 
                                          borderRadius: 4,
                                          cursor: submittingId === it.disclosureId ? 'not-allowed' : 'pointer',
                                          fontWeight: 'bold'
                                        }}
                                      >
                                        却下する
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleDelete(it.disclosureId)}
                                      disabled={submittingId === it.disclosureId}
                                      style={{ 
                                        border: '1px solid #ffccc7', 
                                        background: '#fff1f0', 
                                        color: '#cf1322', 
                                        padding: '8px 24px', 
                                        borderRadius: 4,
                                        cursor: submittingId === it.disclosureId ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      削除する
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default AdminDisclosurePage;
