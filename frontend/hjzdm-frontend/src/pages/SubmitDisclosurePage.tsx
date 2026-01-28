import React, { useState } from 'react';
import { disclosureApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './SubmitDisclosurePage.css';

const SubmitDisclosurePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    disclosurePrice: '',
    imgUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'disclosurePrice' ? value : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await disclosureApi.add({
        ...formData,
        disclosurePrice: parseFloat(formData.disclosurePrice) || 0
      });
      
      if (response.data.code === 200) {
        setMessage({ type: 'success', text: '投稿が送信されました。管理者の審査を通過すると公開されます。' });
        // 重置表单
        setFormData({
          title: '',
          content: '',
          link: '',
          disclosurePrice: '',
          imgUrl: ''
        });
      } else {
        setMessage({ type: 'error', text: response.data.message || '投稿の送信に失敗しました' });
      }
    } catch (error) {
      console.error('投稿エラー:', error);
      setMessage({ type: 'error', text: '投稿の送信中にエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-disclosure-container">
      <Header />
      <div className="submit-disclosure-content">
        <h1>投稿フォーム</h1>
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="disclosure-form">
          <div className="form-group">
            <label htmlFor="title">タイトル *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="投稿のタイトルを入力してください"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">内容 *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              placeholder="投稿の詳細内容を入力してください"
              rows={5}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="link">リンク</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder="関連するウェブサイトのURLを入力してください"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="disclosurePrice">価格</label>
            <input
              type="number"
              id="disclosurePrice"
              name="disclosurePrice"
              value={formData.disclosurePrice}
              onChange={handleInputChange}
              placeholder="価格を入力してください"
              min="0"
              step="any"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="imgUrl">画像URL</label>
            <input
              type="url"
              id="imgUrl"
              name="imgUrl"
              value={formData.imgUrl}
              onChange={handleInputChange}
              placeholder="画像のURLを入力してください"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="btn-cancel"
            >
              キャンセル
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-submit"
            >
              {loading ? '送信中...' : '投稿を送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitDisclosurePage;