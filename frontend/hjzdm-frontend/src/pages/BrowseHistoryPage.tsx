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
  browseTime?: string; // Add this field
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
      // Fetch more items to show a fuller history
      const response = await userApi.getHistory(1, 500);
      // Debug log removed
      setProducts(response.data.data || []);
    } catch (err) {
      setError('閲覧履歴の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGroupedHistory = () => {
    const groups: { [key: string]: HistoryGoods[] } = {
      '今日': [],
      '昨日': [],
      'もっと前': []
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    products.forEach(product => {
      const timeStr = product.browseTime || product.createTime;
      if (!timeStr) {
        groups['もっと前'].push(product);
        return;
      }
      
      const date = new Date(timeStr);
      const dateZero = new Date(date);
      dateZero.setHours(0, 0, 0, 0);

      if (dateZero.getTime() === today.getTime()) {
        groups['今日'].push(product);
      } else if (dateZero.getTime() === yesterday.getTime()) {
        groups['昨日'].push(product);
      } else {
        groups['もっと前'].push(product);
      }
    });

    return groups;
  };

  const groupedHistory = getGroupedHistory();

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
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>閲覧履歴</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button className="clear-button" onClick={loadHistory} style={{ background: '#2196F3' }}>
                更新
            </button>
            {products.length > 0 && (
            <button className="clear-button" onClick={clearHistory}>
                履歴をクリア
            </button>
            )}
        </div>
      </div>
      
      {loading ? (
        <div className="no-products">読み込み中...</div>
      ) : error ? (
        <div className="no-products">{error}</div>
      ) : products.length === 0 ? (
        <div className="no-products">閲覧履歴がありません</div>
      ) : (
        <div className="product-list-container">
          {Object.entries(groupedHistory).map(([label, groupProducts]) => {
            if (groupProducts.length === 0) return null;
            return (
              <div key={label} className="history-group">
                <h3 className="group-label">{label}</h3>
                <div className="product-list">
                  {groupProducts.map((product) => (
                    <div key={product.goodsId} className="product-item">
                      <div className="product-info">
                        <div className="product-image">
                          <img 
                            src={product.imgUrl || 'https://picsum.photos/100/100?random=product'} 
                            alt={product.goodsName} 
                          />
                        </div>
                        <div className="product-details">
                          <h4>
                            <a href={product.goodsLink || '#'} target="_blank" rel="noopener noreferrer">
                                {product.goodsName}
                            </a>
                          </h4>
                          <div className="price">¥{product.goodsPrice}</div>
                          <div className="browse-time">
                              {product.browseTime ? new Date(product.browseTime).toLocaleTimeString() : (product.createTime ? new Date(product.createTime).toLocaleTimeString() : '')}
                          </div>
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
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default BrowseHistoryPage;
