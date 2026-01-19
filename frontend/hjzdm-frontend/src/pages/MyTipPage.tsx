import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import './MyTipPage.css';
import { disclosureApi, commonApi } from '../services/api';

interface Disclosure {
  disclosureId: number;
  title: string;
  content: string;
  link: string;
  disclosurePrice: number;
  imgUrl?: string;
  createTime: string;
  status: number; // 0: Pending, 1: Approved, 2: Rejected
}

const MyTipPage: React.FC = () => {
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    price: '',
    imgUrl: ''
  });

  useEffect(() => {
    loadDisclosures();
  }, []);

  const loadDisclosures = async () => {
    try {
      setLoading(true);
      const res = await disclosureApi.getMyDisclosure(1, 100);
      setDisclosures(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await disclosureApi.add({
        title: formData.title,
        content: formData.content,
        link: formData.link,
        disclosurePrice: Number(formData.price),
        imgUrl: formData.imgUrl
      });
      alert('投稿しました！審査をお待ちください。'); // Submitted! Please wait for review.
      setShowForm(false);
      setFormData({ title: '', content: '', link: '', price: '', imgUrl: '' });
      loadDisclosures();
    } catch (err) {
      alert('投稿に失敗しました。'); // Failed to submit.
      console.error(err);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '審査中';
      case 1: return '承認済';
      case 2: return '却下';
      default: return '不明';
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case 0: return 'pending';
      case 1: return 'approved';
      case 2: return 'rejected';
      default: return '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('本当に削除しますか？この操作は取り消せません。')) {
      return;
    }
    try {
      await disclosureApi.delete(id);
      loadDisclosures();
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました。');
    }
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    try {
      const res = await commonApi.upload(file);
      if (res.data && res.data.code === 200) {
        const fullUrl = res.data.data;
        setFormData(prev => ({ ...prev, imgUrl: fullUrl }));
      } else {
        alert('アップロード失敗');
      }
    } catch (e) {
      console.error(e);
      alert('アップロードエラー');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="my-tip-page-wrapper" style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 15px' }}>
      <UserSidebar />
      <div className="my-tip-page" style={{ flex: 1, padding: '20px', margin: 0, maxWidth: 'none', background: '#fff' }}>
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>マイヒント (投稿管理)</h2>
          <button className="submit-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'キャンセル' : '新規投稿'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="tip-form">
            <div className="form-group">
              <label>商品名 / タイトル</label>
              <input 
                type="text" 
                required 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="例: iPhone 15 Pro 256GB"
              />
            </div>
            <div className="form-group">
              <label>価格 (円)</label>
              <input 
                type="number" 
                required 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="例: 150000"
              />
            </div>
            <div className="form-group">
              <label>商品リンク (URL)</label>
              <input 
                type="url" 
                required 
                value={formData.link} 
                onChange={e => setFormData({...formData, link: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label>画像</label>
              <div 
                className="image-uploader"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ 
                  border: '2px dashed #ccc', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#fafafa',
                  marginBottom: '10px'
                }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {formData.imgUrl ? (
                    <img src={formData.imgUrl} alt="Preview" style={{ maxHeight: '300px', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                ) : (
                    <p style={{ color: '#999', margin: 0 }}>画像をドラッグ＆ドロップ、またはクリックしてアップロード</p>
                )}
                <input 
                    id="file-input"
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileChange(e.target.files)}
                />
              </div>
              <input 
                type="text" 
                value={formData.imgUrl} 
                onChange={e => setFormData({...formData, imgUrl: e.target.value})}
                placeholder="または画像URLを直接入力"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div className="form-group">
              <label>説明 / コメント</label>
              <textarea 
                required 
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})}
                placeholder="お得な情報や詳細を記入してください..."
              />
            </div>
            <button type="submit" className="submit-btn">
              投稿する
            </button>
          </form>
        )}
        
        {loading ? (
          <div>読み込み中...</div>
        ) : disclosures.length === 0 ? (
          <div className="no-tips">投稿履歴がありません</div>
        ) : (
          <div className="tip-list">
            {disclosures.map((item) => (
              <div key={item.disclosureId} className="tip-item" style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
                <div className="tip-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0 }}>{item.title || '無題'}</h3>
                  <span className={`status status-${getStatusClass(item.status)}`} style={{ padding: '2px 8px', borderRadius: '4px', background: '#eee', fontSize: '12px' }}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  {item.imgUrl && (
                    <img src={item.imgUrl} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div className="tip-content" style={{ marginBottom: '5px' }}>{item.content}</div>
                    <div className="tip-price" style={{ color: '#ff5000', fontWeight: 'bold' }}>¥{item.disclosurePrice}</div>
                    <div className="tip-link">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#0066c0', fontSize: '12px' }}>商品ページへ</a>
                    </div>
                  </div>
                </div>
                <div className="tip-footer" style={{ marginTop: '10px', fontSize: '12px', color: '#999', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="time">{new Date(item.createTime).toLocaleString()}</span>
                  <button 
                    onClick={(e) => handleDelete(e, item.disclosureId)} 
                    style={{ 
                      color: '#999', 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline'
                    }}
                    onMouseOver={(e) => (e.target as HTMLElement).style.color = 'red'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.color = '#999'}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTipPage;
