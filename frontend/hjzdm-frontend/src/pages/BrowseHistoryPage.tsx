import React, { useEffect, useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import { userApi } from '../services/api';
import './BrowseHistoryPage.css';

interface HistoryGoods {
  goodsId: number;
  goodsName: string;
  goodsPrice: number;
  goodsLink?: string;
  imgUrl?: string;
  createTime?: string;
}

const BrowseHistoryPage: React.FC = () => {
  const [products, setProducts] = useState<HistoryGoods[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getHistory(1, 100);
      setProducts(response.data.data || []);
    } catch (err) {
      setError('閲覧履歴の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatBrowseTime = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const clearHistory = () => {
    userApi.clearHistory()
      .then(() => loadHistory())
      .catch((err) => {
        console.error(err);
        setError('履歴のクリアに失敗しました');
      });
  };

  const deleteOne = (goodsId: number) => {
    userApi.deleteHistory(goodsId)
      .then(() => setProducts(prev => prev.filter(p => p.goodsId !== goodsId)))
      .catch((err) => {
        console.error(err);
        setError('履歴の削除に失敗しました');
      });
  };

  return (
    <div className="browse-history-page-wrapper" style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 15px' }}>
      <UserSidebar />
      <div className="browse-history-page" style={{ flex: 1, padding: '20px', margin: 0, maxWidth: 'none', background: '#fff' }}>
      <div className="header">
        <h2>閲覧履歴</h2>
        {products.length > 0 && (
          <button className="clear-button" onClick={clearHistory}>
            履歴をクリア
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="no-products">読み込み中...</div>
      ) : error ? (
        <div className="no-products">{error}</div>
      ) : products.length === 0 ? (
        <div className="no-products">閲覧履歴がありません</div>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <div key={product.goodsId} className="product-item">
              <div className="product-info">
                <div className="product-image">
                  <img 
                    src={product.imgUrl || 'https://picsum.photos/100/100?random=product'} 
                    alt={product.goodsName} 
                  />
                </div>
                <div className="product-details">
                  <h4>{product.goodsName}</h4>
                  <div className="price">¥{product.goodsPrice}</div>
                  {product.createTime && <div className="browse-time">{formatBrowseTime(product.createTime)}</div>}
                </div>
              </div>
              <div className="product-actions">
                {product.goodsLink ? (
                  <a
                    href={product.goodsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-button"
                  >
                    購入する
                  </a>
                ) : (
                  <button className="buy-button" disabled>
                    購入する
                  </button>
                )}
                <button className="clear-button" onClick={() => deleteOne(product.goodsId)}>
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

export default BrowseHistoryPage;
