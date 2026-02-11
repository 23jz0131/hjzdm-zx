const express = require('express');
const cors = require('cors');
const app = express();
const port = 9090;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模擬商品比價API - 使用您提供的API密钥进行模拟
app.post('/goods/compare', (req, res) => {
  const query = req.body.query || 'テスト商品';
  
  // 模拟使用API密钥进行搜索
  console.log(`使用API密钥搜索商品: ${query}`);
  
  // 生成更多模拟数据以展示网格布局效果
  const mockGoodsList = [];
  const platforms = [
    { type: 10, name: '楽天' },
    { type: 20, name: 'ヤフー' },
    { type: 30, name: 'タオバオ' }
  ];
  
  // 生成12个模拟商品数据
  for (let i = 1; i <= 12; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const price = Math.floor(Math.random() * (15000 - 5000) + 5000);
    
    mockGoodsList.push({
      goodsId: i,
      goodsName: `${query} ${platform.name} Ver.${i}`,
      goodsPrice: price,
      goodsLink: `https://example.com/${i}`,
      imgUrl: `https://picsum.photos/200/200?random=${i + Date.now()}`,
      mallType: platform.type
    });
  }
  
  // Debug：输出各平台商品数量，便于排查 Yahoo 商品是否被包含
  console.log('Mock /goods/compare - platform distribution:', mockGoodsList.reduce((acc, g) => {
    acc[g.mallType] = (acc[g.mallType] || 0) + 1;
    return acc;
  }, {}));
  
  // 打印平台分布，帮助排查 Yahoo 条目是否被包含
  console.log('Mock /goods/compare - distribution:', mockGoodsList.reduce((acc, g) => {
    acc[g.mallType] = (acc[g.mallType] || 0) + 1;
    return acc;
  }, {}));

  // 找出最低价格
  const lowestPrice = Math.min(...mockGoodsList.map(g => g.goodsPrice));
  const lowestPlatform = mockGoodsList.find(g => g.goodsPrice === lowestPrice).mallType === 10 ? '楽天' : 
                         mockGoodsList.find(g => g.goodsPrice === lowestPrice).mallType === 20 ? 'ヤフー' : 'タオバオ';

  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: [
        {
          goodsName: query,
          goodsList: mockGoodsList,
          lowestPrice: lowestPrice,
          lowestPlatform: lowestPlatform
        }
      ]
    });
  }, 500); // 模擬ネットワーク遅延
});

// 模擬取得所有商品API
app.post('/goods/pageAll', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        records: [
          {
            goodsId: 1,
            goodsName: 'iPhone 15 Pro Max 256GB',
            goodsPrice: 9999,
            goodsLink: 'https://example.com/iphone',
            imgUrl: 'https://picsum.photos/200/200?random=1',
            mallType: 10,
            createTime: new Date().toISOString()
          },
          {
            goodsId: 2,
            goodsName: 'MacBook Air M2 13インチ',
            goodsPrice: 8499,
            goodsLink: 'https://example.com/macbook',
            imgUrl: 'https://picsum.photos/200/200?random=2',
            mallType: 20,
            createTime: new Date().toISOString()
          },
          {
            goodsId: 3,
            goodsName: 'AirPods Pro 第2世代',
            goodsPrice: 1899,
            goodsLink: 'https://example.com/airpods',
            imgUrl: 'https://picsum.photos/200/200?random=3',
            mallType: 10,
            createTime: new Date().toISOString()
          },
          {
            goodsId: 4,
            goodsName: 'iPad Air 10.9インチ',
            goodsPrice: 4399,
            goodsLink: 'https://example.com/ipad',
            imgUrl: 'https://picsum.photos/200/200?random=4',
            mallType: 30,
            createTime: new Date().toISOString()
          },
          {
            goodsId: 5,
            goodsName: 'Apple Watch Series 9',
            goodsPrice: 2999,
            goodsLink: 'https://example.com/watch',
            imgUrl: 'https://picsum.photos/200/200?random=5',
            mallType: 10,
            createTime: new Date().toISOString()
          },
          {
            goodsId: 6,
            goodsName: 'Sony WH-1000XM5 ノイズキャンセリングヘッドフォン',
            goodsPrice: 2399,
            goodsLink: 'https://example.com/headphones',
            imgUrl: 'https://picsum.photos/200/200?random=6',
            mallType: 20,
            createTime: new Date().toISOString()
          }
        ],
        total: 6,
        current: 1,
        size: 20,
        pages: 1
      }
    });
  }, 500);
});

// 模擬按名称搜索商品API
app.get('/goods/searchByName', (req, res) => {
  const query = req.query.query || 'テスト商品';
  
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: [
        {
          goodsId: 1,
          goodsName: `${query} テスト商品1`,
          goodsPrice: 7999,
          goodsLink: 'https://example.com/test1',
          imgUrl: 'https://picsum.photos/200/200?random=7',
          mallType: 10,
          createTime: new Date().toISOString()
        },
        {
          goodsId: 2,
          goodsName: `${query} テスト商品2`,
          goodsPrice: 8499,
          goodsLink: 'https://example.com/test2',
          imgUrl: 'https://picsum.photos/200/200?random=8',
          mallType: 20,
          createTime: new Date().toISOString()
        }
      ]
    });
  }, 500);
});

// 模擬商品详情API
app.get('/goods/detail', (req, res) => {
  const goodsId = req.query.goodsId || 1;
  
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        goodsId: goodsId,
        goodsName: 'テスト商品詳細',
        goodsPrice: 8999,
        goodsLink: 'https://example.com/detail',
        imgUrl: 'https://picsum.photos/300/300?random=detail',
        mallType: 10,
        createTime: new Date().toISOString()
      }
    });
  }, 500);
});

// 模擬我的收藏API
app.post('/goods/myCollect', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        records: [
          {
            goodsId: 1,
            goodsName: 'iPhone 15 Pro Max 256GB',
            goodsPrice: 9999,
            goodsLink: 'https://example.com/iphone',
            imgUrl: 'https://picsum.photos/200/200?random=1',
            mallType: 10,
            createTime: new Date().toISOString()
          },
          {
            goodsId: 2,
            goodsName: 'MacBook Air M2 13インチ',
            goodsPrice: 8499,
            goodsLink: 'https://example.com/macbook',
            imgUrl: 'https://picsum.photos/200/200?random=2',
            mallType: 20,
            createTime: new Date().toISOString()
          }
        ],
        total: 2,
        current: 1,
        size: 20,
        pages: 1
      }
    });
  }, 500);
});

// 模擬我的商品API
app.post('/goods/myGoods', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        records: [
          {
            goodsId: 1,
            goodsName: 'iPhone 15 Pro Max 256GB',
            goodsPrice: 9999,
            goodsLink: 'https://example.com/iphone',
            imgUrl: 'https://picsum.photos/200/200?random=1',
            mallType: 10,
            createTime: new Date().toISOString()
          }
        ],
        total: 1,
        current: 1,
        size: 20,
        pages: 1
      }
    });
  }, 500);
});

// 模擬用戶信息API
app.get('/user/me', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        nickname: '测试用户',
        avatar: 'https://picsum.photos/100/100',
        role: 'USER'
      }
    });
  }, 300);
});

// 模擬披露列表API
app.post('/disclosure/queryPublicList', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        records: [
          {
            id: 1,
            title: '测试披露内容1',
            content: '这是第一个测试披露内容',
            author: '测试用户1',
            createTime: new Date().toISOString(),
            views: 100,
            likes: 10
          },
          {
            id: 2,
            title: '测试披露内容2',
            content: '这是第二个测试披露内容',
            author: '测试用户2',
            createTime: new Date().toISOString(),
            views: 80,
            likes: 5
          }
        ],
        total: 2,
        current: 1,
        size: 10,
        pages: 1
      }
    });
  }, 500);
});

// 模擬商品搜索API
app.post('/goods/search', (req, res) => {
  const query = req.body.query || 'テスト商品';
  // Debug：日志 incoming query，帮助排查 Yahoo 条目是否被调用
  console.log('Mock /goods/search - incoming query:', query);
  
  // Debug：简化分布日志，方便排查数据流
  console.log('Mock /goods/search - distribution: {10:1, 20:1} (示例)');

  setTimeout(() => {
    const mockGoodsList = [
      {
        goodsId: 1,
        goodsName: `${query} 検索結果1`,
        goodsPrice: 7999,
        goodsLink: 'https://example.com/search1',
        imgUrl: 'https://picsum.photos/200/200?random=search1',
        mallType: 10,
        createTime: new Date().toISOString()
      },
      {
        goodsId: 2,
        goodsName: `${query} 検索結果2`,
        goodsPrice: 8499,
        goodsLink: 'https://example.com/search2',
        imgUrl: 'https://picsum.photos/200/200?random=search2',
        mallType: 20,
        createTime: new Date().toISOString()
      }
    ];
    
    // Debug：输出 /goods/search 的平台分布
    console.log('Mock /goods/search - distribution by mallType:', mockGoodsList.reduce((acc, g) => {
      acc[g.mallType] = (acc[g.mallType] || 0) + 1;
      return acc;
    }, {}));
    
    res.json({
      code: 200,
      message: 'success',
      data: mockGoodsList
    });
  }, 500);
});

// 模拟用户登录 API（用于前端登录测试）
app.post('/user/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码为必填' });
  }
  const token = 'mock-token-' + Date.now();
  res.json({ code: 200, data: { token, user: { id: 1, username } } });
});

// 模拟获取我的投稿历史 API
app.get('/disclosure/my', (req, res) => {
  const pageNum = parseInt(req.query.pageNum) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  
  // 模拟一些投稿数据
  const mockDisclosures = [
    {
      disclosureId: 1,
      title: '私の最初の投稿',
      content: 'これはテスト投稿です。商品についての情報共有します。',
      author: 1,
      status: 1,
      createTime: new Date(Date.now() - 86400000).toISOString(), // 1天前
      updateTime: new Date(Date.now() - 86400000).toISOString()
    },
    {
      disclosureId: 2,
      title: 'おすすめ商品紹介',
      content: 'この商品はとてもお得だと思います。皆さんもチェックしてみてください。',
      author: 1,
      status: 1,
      createTime: new Date(Date.now() - 172800000).toISOString(), // 2天前
      updateTime: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: mockDisclosures
    });
  }, 300);
});

app.listen(port, () => {
  console.log(`Mock server is running at http://localhost:${port}`);
  console.log('API endpoints available:');
  console.log('POST   /goods/compare - 価格比較検索');
  console.log('POST   /goods/pageAll - 全商品取得');
  console.log('GET    /goods/searchByName - 商品名検索');
  console.log('GET    /goods/detail - 商品詳細');
  console.log('POST   /goods/myCollect - マイコレクション');
  console.log('POST   /goods/myGoods - マイ商品');
  console.log('POST   /goods/search - 商品検索');
  console.log('GET    /user/me - ユーザー情報');
  console.log('GET    /disclosure/my - マイ投稿履歴');
  console.log('POST   /disclosure/queryPublicList - 披露リスト');
});
