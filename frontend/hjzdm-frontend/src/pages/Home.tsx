import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { goodsApi } from '../services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  platform: string;
  originalPrice?: number;
  link?: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Categories (Kakaku style list)
  const categories = [
    { key: 'smartphone', name: 'Smartphones / SIM', image: 'https://placehold.co/20x20', query: 'スマートフォン' },
    { key: 'laptop', name: 'PCs / Tablets', image: 'https://placehold.co/20x20', query: 'パソコン' },
    { key: 'camera', name: 'Cameras', image: 'https://placehold.co/20x20', query: 'カメラ' },
    { key: 'appliance', name: 'Home Appliances', image: 'https://placehold.co/20x20', query: '家電' },
    { key: 'audio', name: 'Audio / Headphones', image: 'https://placehold.co/20x20', query: 'イヤホン' },
    { key: 'fashion', name: 'Fashion / Watches', image: 'https://placehold.co/20x20', query: 'ファッション' },
    { key: 'beauty', name: 'Beauty / Health', image: 'https://placehold.co/20x20', query: '美容' },
    { key: 'game', name: 'Games / Toys', image: 'https://placehold.co/20x20', query: 'ゲーム' },
    { key: 'outdoor', name: 'Sports / Outdoor', image: 'https://placehold.co/20x20', query: 'スポーツ' },
    { key: 'car', name: 'Cars / Bikes', image: 'https://placehold.co/20x20', query: '車' }
  ];

  const hotTags = ['iPhone 15', 'MacBook Air', 'Sony WH-1000XM5', 'Nintendo Switch', 'RTX 4070', 'iPad Air'];

  useEffect(() => {
    fetchRecommendedProducts();
  }, []);

  const fetchRecommendedProducts = async () => {
    setLoading(true);
    try {
      // 优先使用真实平台数据：对热门关键词执行比价搜索并汇总最低价商品
      const querySeeds = ['iPhone 15', 'MacBook Air', 'Nintendo Switch', 'Sony WH-1000XM5', 'iPad Air'];
      const collected: Product[] = [];

      for (const q of querySeeds) {
        try {
          const res = await goodsApi.compareGoods(q);
          if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
            // 展开每个分组的最低价商品
            res.data.data.forEach((group: any) => {
              const list = Array.isArray(group.goodsList) ? group.goodsList : [];
              if (list.length > 0) {
                // 选择最低价条目
                const cheapest = list.reduce((min: any, cur: any) => {
                  const mp = typeof cur.goodsPrice === 'number' ? cur.goodsPrice : Number(cur.goodsPrice) || 0;
                  const minp = typeof min.goodsPrice === 'number' ? min.goodsPrice : Number(min.goodsPrice) || 0;
                  return mp > 0 && (minp === 0 || mp < minp) ? cur : min;
                }, list[0]);
                if (cheapest && cheapest.goodsName && cheapest.goodsPrice && cheapest.goodsLink) {
                  collected.push({
                    id: cheapest.goodsId || Math.floor(Math.random() * 1e9),
                    name: cheapest.goodsName,
                    price: cheapest.goodsPrice,
                    imageUrl: typeof cheapest.imgUrl === 'string' ? cheapest.imgUrl : '',
                    platform: getPlatformName(cheapest.mallType),
                    originalPrice: cheapest.goodsPrice ? Math.floor(cheapest.goodsPrice * 1.1) : undefined,
                    link: cheapest.goodsLink
                  });
                }
              }
            });
          }
        } catch (e) {
          // 单个关键词失败时继续其他关键词
          console.warn('compareGoods failed for', q, e);
        }
        if (collected.length >= 10) break;
      }

      // 如果比价数据不足，回退到单平台（乐天）搜索
      if (collected.length < 5) {
        try {
          const fallbackRes = await goodsApi.searchGoods('iphone');
          const items = (fallbackRes.data && fallbackRes.data.data) ? fallbackRes.data.data : [];
          items.forEach((item: any) => {
            collected.push({
              id: item.goodsId,
              name: item.goodsName,
              price: item.goodsPrice,
              imageUrl: typeof item.imgUrl === 'string' ? item.imgUrl : '',
              platform: getPlatformName(item.mallType),
              originalPrice: item.goodsPrice ? Math.floor(item.goodsPrice * 1.1) : undefined,
              link: item.goodsLink
            });
          });
        } catch (e) {
          console.warn('searchGoods fallback failed', e);
        }
      }

      // 去重（按名称），并限制前 10
      const uniqueByName: Record<string, Product> = {};
      collected.forEach(p => {
        if (!uniqueByName[p.name]) {
          uniqueByName[p.name] = p;
        } else {
          // 保留价格更低的
          if (p.price > 0 && (uniqueByName[p.name].price === 0 || p.price < uniqueByName[p.name].price)) {
            uniqueByName[p.name] = p;
          }
        }
      });
      const finalList = Object.values(uniqueByName).slice(0, 10);
      setProducts(finalList);
    } catch (err) {
      console.error('Failed to load products:', err);
      // Fallback data
      setProducts(Array(5).fill(0).map((_, i) => ({
        id: i,
        name: 'Sample Product ' + (i+1),
        price: 10000 + i*500,
        imageUrl: '',
        platform: 'Demo',
        originalPrice: 12000
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/compare?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getPlatformName = (mallType: number): string => {
    switch (mallType) {
      case 10: return '楽天';
      case 20: return 'Yahoo!ショッピング';
      case 30: return 'タオバオ';
      case 40: return 'Amazon';
      default: return 'その他';
    }
  };

  return (
    <div className="home">
      <div className="home-container">
        {/* Left Sidebar: Categories */}
        <aside className="home-sidebar">
          <div className="sidebar-box">
            <h3 className="sidebar-header">カテゴリから探す</h3>
            <ul className="sidebar-menu">
              {categories.map((c) => (
                <li key={c.key}>
                  <div 
                    className="sidebar-menu-item"
                    onClick={() => navigate(`/compare?query=${encodeURIComponent(c.query)}`)}
                  >
                    {/* Placeholder icon logic */}
                    <img 
                      src={c.image} 
                      alt="" 
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                    {c.name}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-box">
            <h3 className="sidebar-header">サービス</h3>
            <ul className="sidebar-menu">
              <li><Link to="/compare" className="sidebar-menu-item">価格比較</Link></li>
              <li><Link to="/browse-history" className="sidebar-menu-item">閲覧履歴</Link></li>
              <li><Link to="/my-collection" className="sidebar-menu-item">マイコレクション</Link></li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="home-main">
          {/* Search Bar */}
          <div className="home-search-section">
            <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', gap: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="商品名、型番、キーワードを入力..."
                className="home-search-input"
              />
              <button type="submit" className="home-search-btn">検索</button>
            </form>
          </div>

          {/* Hot Keywords */}
          <div className="hot-tags">
            <strong>注目キーワード: </strong>
            {hotTags.map(tag => (
              <a 
                key={tag} 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate(`/compare?query=${encodeURIComponent(tag)}`); }}
              >
                {tag}
              </a>
            ))}
          </div>

          {/* Ranking / Featured List */}
          <div style={{ marginTop: '20px' }}>
            <div className="section-header">
              <h3 className="section-title">人気商品ランキング</h3>
              <Link to="/compare" style={{ fontSize: '12px', color: '#0033cc' }}>すべて見る &gt;&gt;</Link>
            </div>

            <div className="ranking-list">
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>ランキング読み込み中...</div>
              ) : (
                products.map((product, index) => (
                  <div key={product.id || index} className="ranking-row">
                    <div className={`rank-num ${index < 3 ? 'top-3' : ''}`}>{index + 1}</div>
                    <div className="rank-img">
                      <img 
                        src={product.imageUrl || 'https://placehold.co/80x80'} 
                        alt={product.name}
                        onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=NoImg'}
                      />
                    </div>
                    <div className="rank-info">
                      {product.link ? (
                        <a 
                          href={product.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="rank-title"
                        >
                          {product.name}
                        </a>
                      ) : (
                        <Link to={`/compare?query=${encodeURIComponent(product.name)}`} className="rank-title">
                          {product.name}
                        </Link>
                      )}
                      <div className="rank-meta">
                        {product.platform} | 評価: ★★★★☆ ({(Math.random() * 100).toFixed(0)})
                      </div>
                      <div className="rank-price">
                        ¥{product.price.toLocaleString()}
                        {product.originalPrice && (
                          <span className="rank-price-sub">
                            ({Math.round((1 - product.price / product.originalPrice) * 100)}% OFF)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
