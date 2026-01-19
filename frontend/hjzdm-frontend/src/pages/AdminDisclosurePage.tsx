import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import { disclosureApi } from '../services/api';

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
  const [activeTab, setActiveTab] = useState<'pending' | 'public'>('pending');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Disclosure[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
        res = await disclosureApi.getPendingDisclosure(1, 200);
      } else {
        res = await disclosureApi.getPublicDisclosure(1, 200);
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
    <div style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 15px' }}>
      <UserSidebar />
      <div style={{ flex: 1, background: '#fff', padding: '20px', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <h2 
              onClick={() => setActiveTab('pending')}
              style={{ 
                margin: 0, 
                cursor: 'pointer', 
                color: activeTab === 'pending' ? '#333' : '#999',
                borderBottom: activeTab === 'pending' ? '2px solid #333' : 'none',
                paddingBottom: 4
              }}
            >
              未承認リスト
            </h2>
            <h2 
              onClick={() => setActiveTab('public')}
              style={{ 
                margin: 0, 
                cursor: 'pointer', 
                color: activeTab === 'public' ? '#333' : '#999',
                borderBottom: activeTab === 'public' ? '2px solid #333' : 'none',
                paddingBottom: 4
              }}
            >
              公開済みリスト
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/community')}
              style={{ border: '1px solid #ddd', background: '#fff', padding: '8px 12px', cursor: 'pointer' }}
            >
              コミュニティへ
            </button>
            <button
              onClick={load}
              disabled={loading}
              style={{ border: '1px solid #ddd', background: '#fff', padding: '8px 12px', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              更新
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fff2f0', color: '#cf1322', border: '1px solid #ffccc7', padding: 10, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div>読み込み中...</div>
        ) : items.length === 0 ? (
          <div style={{ color: '#666' }}>待审核の投稿はありません。</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((it) => {
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15, flex: 1, overflow: 'hidden' }}>
                      <span style={{ color: '#999', fontSize: 12, minWidth: 30 }}>#{it.disclosureId}</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40%' }}>
                        {it.title}
                      </span>
                      <span style={{ color: '#ff4400', fontWeight: 700 }}>¥{it.disclosurePrice}</span>
                      <span style={{ fontSize: 12, color: '#666' }}>{new Date(it.createTime).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {isExpanded ? '▲ 閉じる' : '▼ 詳細・審査'}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #eee', padding: 20, animation: 'fadeIn 0.3s' }}>
                      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                        {/* Image */}
                        <div style={{ width: 240, height: 240, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                          {it.imgUrl ? (
                            <img
                              src={it.imgUrl}
                              alt={it.title}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <span style={{ color: '#ccc' }}>No Image</span>
                          )}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1 }}>
                          <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 18 }}>{it.title}</h3>
                          <div style={{ marginBottom: 15, color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
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
                                  承認する
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
  );
};

export default AdminDisclosurePage;
