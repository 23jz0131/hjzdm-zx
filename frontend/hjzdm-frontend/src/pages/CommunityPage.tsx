import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { disclosureApi, disclosureOperateApi } from '../services/api';

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

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);

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
              <div className="card-image" style={{ height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.imgUrl ? (
                  <img src={item.imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
