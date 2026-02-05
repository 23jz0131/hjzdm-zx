import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
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

  // 添加图片URL转换函数
  const convertImageUrl = (url: string): string => {
    // 如果URL为空或无效，返回空字符串
    if (!url) return '';
    
    // 如果是相对路径且以 /uploads/ 开头，则转换为完整的后端URL
    if (url.startsWith('/uploads/')) {
      // 在开发环境中，使用代理地址；在生产环境中使用绝对URL
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        // 开发环境：通过代理访问后端的/uploads/路径
        return url;
      } else {
        // 生产环境：使用完整的后端URL
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
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check for ID 1 OR username 'admin'
      return payload?.userId === 1 || payload?.sub === 'admin' || payload?.username === 'admin';
    } catch {
      return false;
    }
  })();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (activeTab === 'pending') {
        res = await disclosureApi.queryPendingList({ pageNum: 1, pageSize: 200 });
      } else if (activeTab === 'public') {
        res = await disclosureApi.queryPublicList({ pageNum: 1, pageSize: 200 });
      } else {
        // 获取所有投稿
        const pendingRes = await disclosureApi.queryPendingList({ pageNum: 1, pageSize: 100 });
        const publicRes = await disclosureApi.queryPublicList({ pageNum: 1, pageSize: 100 });
        res = {
          data: {
            data: [...(pendingRes.data?.data || []), ...(publicRes.data?.data || [])]
          }
        };
      }
      setItems(res.data?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.msg || e?.response?.data?.message || '読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

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
                  onClick={load}
                  disabled={loading}
                  className={`action-button refresh-button ${loading ? 'disabled' : ''}`}
                >
                  {loading ? '読み込み中...' : '更新'}
                </button>
              </div>
            </div>
          </div>

          {/* 统一审查面板 - 状态标签和内容一体化 */}
          <div className="unified-review-panel">
            {/* 状态标签栏 */}
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
            
            {/* 分割线 */}
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
              ) : items.filter(item => 
                activeTab === 'all' || 
                (activeTab === 'pending' && item.status === 0) || 
                (activeTab === 'public' && item.status === 1)
              ).length === 0 ? (
                <div className="empty-state">
                  {activeTab === 'all' ? '投稿がありません。' : 
                   activeTab === 'pending' ? '審査待ちの投稿はありません。' : 
                   '公開済みの投稿はありません。'}
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
        <div className="sidebar-content">
          <UserSidebar />
        </div>
      </div>
    </div>
  );
};

export default AdminDisclosurePage;
