import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { disclosureApi, disclosureOperateApi, commentApi } from '../services/api';

interface Disclosure {
  disclosureId: number;
  title: string;
  content: string;
  link: string;
  disclosurePrice: number;
  imgUrl?: string;
  createTime: string;
  authorName?: string;
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
}

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentMap, setCommentMap] = useState<Record<number, Comment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<number, string>>({});
  const [replyTo, setReplyTo] = useState<Record<number, Comment | null>>({});
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadDisclosures();
  }, []);

  const loadDisclosures = async () => {
    try {
      setLoading(true);
      const res = await disclosureApi.getPublicDisclosure(1, 100);
      setDisclosures(res.data.data || []);
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
      const list: Comment[] = res.data.data || [];
      setCommentMap(prev => ({ ...prev, [disclosureId]: list }));
    } catch (e) {
      console.error(e);
    } finally {
      setCommentLoading(prev => ({ ...prev, [disclosureId]: false }));
    }
  };

  const toggleComments = (disclosureId: number) => {
    const isOpen = openComments[disclosureId];
    const nextOpen = !isOpen;
    setOpenComments(prev => ({ ...prev, [disclosureId]: nextOpen }));
    if (nextOpen && !commentMap[disclosureId]) {
      loadComments(disclosureId);
    }
  };

  const handleSubmitComment = async (disclosureId: number) => {
    if (!ensureLogin()) return;
    const text = (commentInput[disclosureId] || '').trim();
    if (!text) {
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
        // 强制重新加载评论列表
        await loadComments(disclosureId);
      } else {
        alert(res.data.msg || 'コメントの投稿に失敗しました');
      }
    } catch (e) {
      console.error(e);
      alert('エラーが発生しました');
    }
  };

  const handleDeleteComment = async (disclosureId: number, commentId: number) => {
    if (!ensureLogin()) return;
    if (!window.confirm('本当にこのコメントを削除しますか？')) {
      return;
    }
    try {
      await commentApi.del(commentId);
      loadComments(disclosureId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = (disclosureId: number, comment: Comment) => {
    if (!ensureLogin()) return;
    setReplyTo(prev => ({ ...prev, [disclosureId]: comment }));
    setOpenComments(prev => ({ ...prev, [disclosureId]: true }));
  };

  const handleLike = async (id: number) => {
    if (!ensureLogin()) return;
    await disclosureOperateApi.like(id);
  };

  const handleCollect = async (id: number) => {
    if (!ensureLogin()) return;
    await disclosureOperateApi.collect(id);
  };

  return (
    <div className="community-page-wrapper" style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 15px' }}>
      <h2 style={{ marginBottom: '20px' }}>みんなの投稿 (承認済み)</h2>
      
      {loading ? (
        <div>読み込み中...</div>
      ) : disclosures.length === 0 ? (
        <div className="no-tips">投稿がまだありません</div>
      ) : (
        <div className="community-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {disclosures.map((item) => (
            <div key={item.disclosureId} className="community-card" style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div className="card-image" style={{ height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {item.imgUrl ? (
                  <img src={item.imgUrl.split(',')[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ background: '#ff5000', color: '#fff', padding: '5px 15px', borderRadius: '15px', textDecoration: 'none', fontSize: '13px' }}>
                    詳細へ
                  </a>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleLike(item.disclosureId)} style={{ border: '1px solid #ddd', background: '#fff', padding: '5px 10px', cursor: 'pointer' }}>点赞</button>
                    <button onClick={() => handleCollect(item.disclosureId)} style={{ border: '1px solid #ddd', background: '#fff', padding: '5px 10px', cursor: 'pointer' }}>收藏</button>
                    <button
                      onClick={() => toggleComments(item.disclosureId)}
                      style={{ border: '1px solid #ddd', background: '#fff', padding: '5px 10px', cursor: 'pointer' }}
                    >
                      {openComments[item.disclosureId] ? '隠す' : 'コメント'}
                    </button>
                  </div>
                </div>
                {openComments[item.disclosureId] && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                    <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>コメント</div>
                    {commentLoading[item.disclosureId] ? (
                      <div style={{ fontSize: '12px', color: '#999' }}>読み込み中...</div>
                    ) : (commentMap[item.disclosureId] || []).length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#999', padding: '8px 0' }}>コメントはまだありません。</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(commentMap[item.disclosureId] || []).map((c) => {
                          const commentsForDisclosure = commentMap[item.disclosureId] || [];
                          const parent = c.parentId ? commentsForDisclosure.find(p => p.id === c.parentId) : undefined;
                          const isReply = !!parent;
                          return (
                            <div
                              key={c.id}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '6px 8px',
                                background: '#fafafa',
                                borderRadius: '4px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', fontSize: '12px' }}>
                                <span style={{ fontWeight: 600, marginRight: '6px' }}>
                                  {c.publisher ? '投稿者 ' : ''}
                                  {c.nickName || '匿名'}
                                </span>
                                <span style={{ color: '#999', fontSize: '11px' }}>
                                  {new Date(c.createTime).toLocaleString()}
                                </span>
                              </div>
                              <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                                {isReply && parent ? (
                                  <span style={{ color: '#666', marginRight: '4px' }}>
                                    返信 @{parent.nickName || '匿名'}:
                                  </span>
                                ) : null}
                                <span>{c.content}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#0066c0' }}>
                                <button
                                  type="button"
                                  onClick={() => handleReply(item.disclosureId, c)}
                                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                                >
                                  返信
                                </button>
                                {c.owner && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(item.disclosureId, c.id)}
                                    style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: '#d00' }}
                                  >
                                    削除
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ marginTop: '8px' }}>
                      {replyTo[item.disclosureId] && (
                        <div style={{ fontSize: '12px', marginBottom: '4px', color: '#666' }}>
                          返信先: {replyTo[item.disclosureId]?.nickName || '匿名'}{' '}
                          <button
                            type="button"
                            onClick={() => setReplyTo(prev => ({ ...prev, [item.disclosureId]: null }))}
                            style={{ border: 'none', background: 'none', padding: 0, marginLeft: '4px', cursor: 'pointer', color: '#999' }}
                          >
                            取消
                          </button>
                        </div>
                      )}
                      <textarea
                        value={commentInput[item.disclosureId] || ''}
                        onChange={e => setCommentInput(prev => ({ ...prev, [item.disclosureId]: e.target.value }))}
                        placeholder={replyTo[item.disclosureId] ? `返信 @${replyTo[item.disclosureId]?.nickName || '匿名'}...` : "コメントを入力してください..."}
                        style={{ width: '100%', minHeight: '60px', padding: '6px 8px', fontSize: '13px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                      <div style={{ textAlign: 'right', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleSubmitComment(item.disclosureId)}
                          style={{ background: '#ff5000', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                        >
                          投稿
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
