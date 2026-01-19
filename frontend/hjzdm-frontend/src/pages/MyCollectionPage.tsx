import React, { useState, useEffect } from 'react';
import { goodsApi } from '../services/api';
import UserSidebar from '../components/UserSidebar';
import './MyCollectionPage.css';

interface Product {
  goodsId?: number;
  goodsName: string;
  goodsPrice: number;
  goodsLink: string;
  imgUrl?: string;
  mallType: number;
}

const MyCollectionPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await goodsApi.getMyCollect(1, 20);
      setProducts(response.data.data?.records || []);
    } catch (err) {
      setError('コレクション商品の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformName = (mallType: number): string => {
    switch (mallType) {
      case 10: return '楽天';
      case 20: return 'ヤフー';
      case 30: return 'タオバオ';
      default: return '不明なプラットフォーム';
    }
  };

  const handleCancelCollect = async (goodsId: number) => {
    // 実際のアプリケーションでは、コレクション解除APIを呼び出す必要があります
    console.log(`コレクション解除商品: ${goodsId}`);
    // ローカル状態を更新
    setProducts(products.filter(product => product.goodsId !== goodsId));
  };

  if (loading) {
    return (
      <div className="my-collection-page-wrapper" style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 15px' }}>
        <UserSidebar />
        <div className="my-collection-page" style={{ flex: 1, padding: 0, margin: 0, maxWidth: 'none', background: 'transparent' }}>
          <div className="loading">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-collection-page-wrapper" style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 15px' }}>
        <UserSidebar />
        <div className="my-collection-page" style={{ flex: 1, padding: 0, margin: 0, maxWidth: 'none', background: 'transparent' }}>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-collection-page-wrapper" style={{ display: 'flex', maxWidth: '1200px', margin: '20px auto', gap: '20px', padding: '0 15px' }}>
      <UserSidebar />
      <div className="my-collection-page" style={{ flex: 1, padding: '20px', margin: 0, maxWidth: 'none', background: '#fff' }}>
        <h2>マイコレクション</h2>
        {products.length === 0 ? (
          <div className="no-products">コレクション商品がありません</div>
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
                    <div className="platform">{getPlatformName(product.mallType)}</div>
                  </div>
                </div>
                <div className="product-actions">
                  <a 
                    href={product.goodsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="buy-button"
                  >
                    購入する
                  </a>
                  <button 
                    className="unlike-button"
                    onClick={() => handleCancelCollect(product.goodsId!)}
                  >
                    コレクション解除
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

export default MyCollectionPage;