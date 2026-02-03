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
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
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

  // 监听用户切换事件
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log('检测到用户切换，重新加载投稿数据');
        loadDisclosures();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 定期检查用户状态
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        // 用户已退出登录
        setDisclosures([]);
      }
    }, 2000);

    return () => clearInterval(interval);
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

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // ヘルパー関数：URLを短縮
  const shortenUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      
      if (domain.length + path.length > maxLength) {
        return `${domain}${path.substring(0, maxLength - domain.length - 3)}...`;
      }
      return url;
    } catch {
      // 如果 URL 解析失败，直接截断
      return url.substring(0, maxLength) + '...';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // フロントエンドバリデーション
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
    <div className="tip-container">
      <div className="tip-layout">
        <div className="main-content">
          <div className="tip-header">
            <h1>マイヒント (投稿管理)</h1>
            <button className="submit-button" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'キャンセル' : '📝 新規投稿'}
            </button>
          </div>

          {showForm && (
            <div className="tip-form-section">
              <form onSubmit={handleSubmit} className="tip-form">
                <div className="form-group">
                  <label>商品名 / タイトル</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="例: iPhone 15 Pro 256GB"
                    className="form-input"
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
                    className="form-input"
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
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>画像 (最大4枚)</label>
                  <div 
                    className="image-uploader"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {/* プレビュー画像リスト */}
                    {formData.imgUrls.map((url, index) => (
                      <div key={index} className="upload-preview">
                        <img src={url} alt={`Uploaded ${index}`} />
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="remove-image-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* 追加ボタン (4枚未満の場合のみ表示) */}
                    {formData.imgUrls.length < 4 && (
                      <div 
                        className="add-image-btn"
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <span>+</span>
                        <span>
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
                    className="form-textarea"
                  />
                </div>
                <button type="submit" className="submit-btn">
                  📤 投稿する
                </button>
              </form>
            </div>
          )}
        
          <div className="tip-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>読み込み中...</span>
              </div>
            ) : disclosures.length === 0 ? (
              <div className="no-tips">投稿履歴がありません</div>
            ) : (
              <div className="tip-list">
                {disclosures.map((item) => (
                  <div key={item.disclosureId} className="tip-item">
                    <div className="tip-item-header">
                      <h3 className="tip-title" title={item.title}>{item.title || '無題'}</h3>
                      <span className={`status status-${getStatusClass(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <div className="tip-content-preview">
                      <div className="tip-image-container">
                        {item.imgUrl ? (
                          <img src={item.imgUrl.split(',')[0]} alt={item.title} />
                        ) : (
                          <span>No Image</span>
                        )}
                      </div>
                      <div className="tip-details">
                        <div className="tip-price">¥{item.disclosurePrice.toLocaleString()}</div>
                        <div className="tip-link">
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="link-text"
                            title={item.link}
                          >
                            {shortenUrl(item.link, 60)}
                          </a>
                        </div>
                      </div>
                    </div>
                    {!expandedItems.has(item.disclosureId) && (
                      <button
                        onClick={() => toggleExpand(item.disclosureId)}
                        className="expand-toggle-button"
                      >
                        🔍 詳細を表示
                      </button>
                    )}
                    {expandedItems.has(item.disclosureId) && (
                      <div className="expanded-content">
                        <div className="tip-content-full">
                          {item.content}
                        </div>
                        {item.imgUrl && item.imgUrl.split(',').length > 1 && (
                          <div>
                            <div className="additional-images-title">追加画像:</div>
                            <div className="additional-images-container">
                              {item.imgUrl.split(',').slice(1).map((img, idx) => (
                                <div key={idx} className="additional-image-item">
                                  <img src={img} alt={`${item.title}-extra-${idx}`} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => toggleExpand(item.disclosureId)}
                          className="expand-toggle-button"
                        >
                          🔼 詳細を隠す
                        </button>
                      </div>
                    )}
                    <div className="tip-footer">
                      <span className="time">{new Date(item.createTime).toLocaleString()}</span>
                      <button 
                        onClick={(e) => handleDelete(e, item.disclosureId)} 
                        className="delete-btn"
                      >
                        🗑️ 削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="sidebar-content">
          <UserSidebar />
        </div>
      </div>
    </div>
  );
};

export default MyTipPage;