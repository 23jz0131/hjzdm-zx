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
    imgUrls: [] as string[]
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
    
    // 前端校验
    if (formData.title.length > 200) {
        alert('商品名/タイトルは200文字以内で入力してください。');
        return;
    }
    if (formData.link.length > 2000) {
        alert('リンクURLが長すぎます（2000文字以内）。');
        return;
    }
    if (formData.content.length > 2000) {
        alert('説明/コメントは2000文字以内で入力してください。');
        return;
    }
    
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0 || priceNum > 100000000) {
        alert('価格は0〜1億円の範囲で入力してください。');
        return;
    }

    try {
      await disclosureApi.add({
        title: formData.title,
        content: formData.content,
        link: formData.link,
        disclosurePrice: Number(formData.price),
        imgUrl: formData.imgUrls.join(',') // 将数组用逗号连接成字符串
      });
      alert('投稿しました！審査をお待ちください。'); // Submitted! Please wait for review.
      setShowForm(false);
      setFormData({ title: '', content: '', link: '', price: '', imgUrls: [] });
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
    
    // 检查数量限制
    if (formData.imgUrls.length + files.length > 4) {
        alert('画像は最大4枚までです');
        return;
    }

    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください: ' + file.name);
            continue;
        }

        try {
            const res = await commonApi.upload(file);
            if (res.data && res.data.code === 200) {
                newUrls.push(res.data.data);
            } else {
                alert('アップロード失敗: ' + file.name);
            }
        } catch (e) {
            console.error(e);
            alert('アップロードエラー: ' + file.name);
        }
    }

    setFormData(prev => ({ ...prev, imgUrls: [...prev.imgUrls, ...newUrls] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
        ...prev,
        imgUrls: prev.imgUrls.filter((_, i) => i !== index)
    }));
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
              <label>画像 (最大4枚)</label>
              <div 
                className="image-uploader"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ 
                  border: '2px dashed #e0e0e0', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  background: '#fafafa',
                  marginBottom: '10px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '15px',
                  alignItems: 'flex-start',
                  minHeight: '120px'
                }}
              >
                {/* プレビュー画像リスト */}
                {formData.imgUrls.map((url, index) => (
                    <div key={index} style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <img src={url} alt={`Uploaded ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{ 
                                position: 'absolute', 
                                top: '4px', 
                                right: '4px', 
                                background: 'rgba(0, 0, 0, 0.6)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '50%', 
                                width: '22px', 
                                height: '22px', 
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 1
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}

                {/* 追加ボタン (4枚未満の場合のみ表示) */}
                {formData.imgUrls.length < 4 && (
                    <div 
                        onClick={() => document.getElementById('file-input')?.click()}
                        style={{ 
                            width: '100px', 
                            height: '100px', 
                            border: '2px dashed #ccc', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer', 
                            background: '#fff',
                            color: '#999',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#ff5000';
                            e.currentTarget.style.color = '#ff5000';
                            e.currentTarget.style.background = '#fff5f0';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#ccc';
                            e.currentTarget.style.color = '#999';
                            e.currentTarget.style.background = '#fff';
                        }}
                    >
                        <span style={{ fontSize: '32px', lineHeight: '32px', fontWeight: '300' }}>+</span>
                        <span style={{ fontSize: '10px', marginTop: '5px' }}>
                            {formData.imgUrls.length === 0 ? '画像を追加' : '追加'}
                        </span>
                    </div>
                )}

                {/* 非表示のファイル入力 */}
                <input 
                    id="file-input"
                    type="file" 
                    accept="image/*" 
                    multiple
                    style={{ display: 'none' }} 
                    onChange={(e) => handleFileChange(e.target.files)}
                />
              </div>
              
              {/* URL入力欄 (オプション) */}
              <input 
                type="text" 
                value={formData.imgUrls.join(',')}
                readOnly
                placeholder="アップロードされた画像のURLがここに表示されます"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', background: '#f9f9f9', color: '#666', fontSize: '12px' }}
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                ※ ドラッグ＆ドロップでも画像を追加できます
              </div>
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
                <div className="tip-header" style={{ display: 'grid', gridTemplateColumns: '1fr 80px', alignItems: 'center', marginBottom: '10px', gap: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.title}>{item.title || '無題'}</h3>
                  <span className={`status status-${getStatusClass(item.status)}`} style={{ padding: '4px 8px', borderRadius: '4px', background: '#f5f5f5', fontSize: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ width: '80px', height: '80px', flexShrink: 0, background: '#f9f9f9', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                    {item.imgUrl ? (
                      <img src={item.imgUrl.split(',')[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '10px', color: '#ccc' }}>No Image</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="tip-content" style={{ marginBottom: '5px', fontSize: '14px', color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                        {item.content}
                    </div>
                    <div>
                        <div className="tip-price" style={{ color: '#ff5000', fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>¥{item.disclosurePrice}</div>
                        <div className="tip-link" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#0066c0', fontSize: '12px' }}>{item.link}</a>
                        </div>
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
