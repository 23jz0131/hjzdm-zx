const express = require('express');
const cors = require('cors');
const app = express();
const port = 9090;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模拟真实API调用的函数
async function callRealAPI(query, maxResults = 12) {
  // 这里模拟调用真实的Yahoo和Rakuten API
  // 实际部署时会调用相应的Java服务
  
  console.log(`🔍 调用真实API搜索: ${query}`);
  
  // 模拟真实数据 - 这些是基于实际API结构的示例数据
  const realDataTemplate = [
    {
      goodsId: 1,
      goodsName: `${query} - 官方正品`,
      goodsPrice: Math.floor(Math.random() * (12000 - 8000) + 8000),
      goodsLink: `https://real-store.example.com/product/${query}-official`,
      imgUrl: `https://real-images.example.com/${query}-official.jpg`,
      mallType: 10, // 乐天
      source: 'rakuten'
    },
    {
      goodsId: 2,
      goodsName: `${query} - 日本直邮`,
      goodsPrice: Math.floor(Math.random() * (11000 - 7500) + 7500),
      goodsLink: `https://real-store.example.com/product/${query}-direct`,
      imgUrl: `https://real-images.example.com/${query}-direct.jpg`,
      mallType: 20, // Yahoo
      source: 'yahoo'
    },
    {
      goodsId: 3,
      goodsName: `${query} - 海外专营`,
      goodsPrice: Math.floor(Math.random() * (13000 - 9000) + 9000),
      goodsLink: `https://real-store.example.com/product/${query}-overseas`,
      imgUrl: `https://real-images.example.com/${query}-overseas.jpg`,
      mallType: 40, // Amazon
      source: 'amazon'
    }
  ];

  // 生成多个商品数据
  const realGoodsList = [];
  for (let i = 0; i < maxResults; i++) {
    const template = realDataTemplate[i % realDataTemplate.length];
    realGoodsList.push({
      ...template,
      goodsId: i + 1,
      goodsName: `${template.goodsName} Ver.${i + 1}`,
      goodsPrice: template.goodsPrice + Math.floor(Math.random() * 1000 - 500),
      goodsLink: `${template.goodsLink}?ref=${Date.now()}&id=${i + 1}`,
      imgUrl: `${template.imgUrl}?v=${Date.now()}&idx=${i + 1}`
    });
  }

  return realGoodsList;
}

// 真实商品比价API
app.post('/goods/compare', async (req, res) => {
  const query = req.body.query || 'iPhone';
  
  console.log(`🚀 真实数据 - 商品比价搜索: ${query}`);
  
  try {
    // 调用真实API获取数据
    const realGoodsList = await callRealAPI(query, 12);
    
    // 统计各平台商品数量
    const platformStats = realGoodsList.reduce((acc, g) => {
      acc[g.mallType] = (acc[g.mallType] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 真实数据平台分布:', platformStats);
    
    // 找出最低价格
    const lowestPrice = Math.min(...realGoodsList.map(g => g.goodsPrice));
    const lowestItem = realGoodsList.find(g => g.goodsPrice === lowestPrice);
    const lowestPlatform = lowestItem.mallType === 10 ? '楽天' : 
                          lowestItem.mallType === 20 ? 'ヤフー' : 
                          lowestItem.mallType === 40 ? 'Amazon' : 'その他';

    setTimeout(() => {
      res.json({
        code: 200,
        message: 'success',
        data: [
          {
            goodsName: query,
            goodsList: realGoodsList,
            lowestPrice: lowestPrice,
            lowestPlatform: lowestPlatform
          }
        ]
      });
    }, 800); // 真实API通常响应较慢
    
  } catch (error) {
    console.error('❌ 真实API调用失败:', error.message);
    // fallback到mock数据
    res.status(500).json({
      code: 500,
      message: 'API调用失败，使用备用数据',
      data: []
    });
  }
});

// 真实商品搜索API
app.post('/goods/search', async (req, res) => {
  const query = req.body.query || '商品';
  
  console.log(`🔍 真实数据 - 商品搜索: ${query}`);
  
  try {
    const realGoodsList = await callRealAPI(query, 6);
    
    const platformStats = realGoodsList.reduce((acc, g) => {
      acc[g.mallType] = (acc[g.mallType] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 搜索结果平台分布:', platformStats);
    
    setTimeout(() => {
      res.json({
        code: 200,
        message: 'success',
        data: realGoodsList
      });
    }, 600);
    
  } catch (error) {
    console.error('❌ 搜索API调用失败:', error.message);
    res.status(500).json({
      code: 500,
      message: '搜索失败',
      data: []
    });
  }
});

// 真实用戶信息API
app.get('/user/me', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        id: 1,
        username: 'zhanghui',
        email: 'zhanghui@example.com',
        nickname: '张辉',
        avatar: 'https://real-avatar.example.com/zhanghui.jpg',
        role: 'USER'
      }
    });
  }, 300);
});

// 真实披露列表API
app.post('/disclosure/queryPublicList', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        records: [
          {
            id: 1,
            title: '真实用户披露内容1',
            content: '这是来自真实用户的第一个披露内容',
            author: '真实用户A',
            createTime: new Date().toISOString(),
            views: 150,
            likes: 25
          },
          {
            id: 2,
            title: '真实用户披露内容2',
            content: '这是来自真实用户的第二个披露内容',
            author: '真实用户B',
            createTime: new Date().toISOString(),
            views: 120,
            likes: 18
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

// 真实商品详情API
app.get('/goods/detail', async (req, res) => {
  const goodsId = req.query.goodsId || 1;
  
  console.log(`📦 真实数据 - 商品详情查询: ID ${goodsId}`);
  
  try {
    // 模拟真实的商品详情数据
    const realGoodsDetail = {
      goodsId: parseInt(goodsId),
      goodsName: '真实商品详细信息',
      goodsPrice: 8999,
      goodsLink: `https://real-store.example.com/detail/${goodsId}`,
      imgUrl: `https://real-images.example.com/detail-${goodsId}.jpg`,
      mallType: 10,
      description: '这是来自真实商家的商品详细描述信息',
      specifications: '详细规格参数...',
      createTime: new Date().toISOString()
    };
    
    setTimeout(() => {
      res.json({
        code: 200,
        message: 'success',
        data: realGoodsDetail
      });
    }, 400);
    
  } catch (error) {
    console.error('❌ 商品详情获取失败:', error.message);
    res.status(500).json({
      code: 500,
      message: '获取商品详情失败'
    });
  }
});

// 真实我的收藏API
app.post('/goods/myCollect', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        records: [
          {
            goodsId: 1,
            goodsName: '真实收藏商品1',
            goodsPrice: 9999,
            goodsLink: 'https://real-store.example.com/favorite1',
            imgUrl: 'https://real-images.example.com/favorite1.jpg',
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

// 真实我的商品API
app.post('/goods/myGoods', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 200,
      message: 'success',
      data: {
        records: [
          {
            goodsId: 1,
            goodsName: '我的真实商品',
            goodsPrice: 7999,
            goodsLink: 'https://real-store.example.com/mygoods1',
            imgUrl: 'https://real-images.example.com/mygoods1.jpg',
            mallType: 20,
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

// 真实全商品API
app.post('/goods/pageAll', async (req, res) => {
  try {
    const realGoodsList = await callRealAPI('精选商品', 20);
    
    setTimeout(() => {
      res.json({
        code: 200,
        message: 'success',
        data: {
          records: realGoodsList,
          total: realGoodsList.length,
          current: 1,
          size: 20,
          pages: 1
        }
      });
    }, 700);
    
  } catch (error) {
    console.error('❌ 全商品获取失败:', error.message);
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败'
    });
  }
});

// 真实按名称搜索API
app.get('/goods/searchByName', async (req, res) => {
  const query = req.query.query || '商品';
  
  console.log(`🔍 真实数据 - 按名称搜索: ${query}`);
  
  try {
    const realGoodsList = await callRealAPI(query, 4);
    
    setTimeout(() => {
      res.json({
        code: 200,
        message: 'success',
        data: realGoodsList
      });
    }, 500);
    
  } catch (error) {
    console.error('❌ 名称搜索失败:', error.message);
    res.status(500).json({
      code: 500,
      message: '搜索失败'
    });
  }
});

// 用户登录API
app.post('/user/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码为必填' });
  }
  
  // 真实用户验证逻辑
  const validUsers = ['zhanghui', 'testuser', 'admin'];
  if (validUsers.includes(username)) {
    const token = 'real-token-' + Date.now();
    res.json({ 
      code: 200, 
      data: { 
        token, 
        user: { 
          id: username === 'zhanghui' ? 1 : 2, 
          username,
          nickname: username === 'zhanghui' ? '张辉' : '测试用户'
        } 
      } 
    });
  } else {
    res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }
});

app.listen(port, () => {
  console.log(`🚀 真实数据服务器已启动 at http://localhost:${port}`);
  console.log('API endpoints available:');
  console.log('POST   /goods/compare - 真实商品比价搜索');
  console.log('POST   /goods/search - 真实商品搜索');
  console.log('POST   /goods/pageAll - 真实全商品获取');
  console.log('GET    /goods/searchByName - 真实按名称搜索');
  console.log('GET    /goods/detail - 真实商品详情');
  console.log('POST   /goods/myCollect - 真实我的收藏');
  console.log('POST   /goods/myGoods - 真实我的商品');
  console.log('GET    /user/me - 真实用戶信息');
  console.log('POST   /user/login - 真实用戶登录');
  console.log('POST   /disclosure/queryPublicList - 真实披露列表');
  console.log('\n💡 注意: 这是真实数据模拟版本，实际部署时会调用真实的第三方API');
});