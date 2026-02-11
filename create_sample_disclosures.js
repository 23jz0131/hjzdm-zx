const axios = require('axios');

async function createSampleDisclosures() {
    console.log('=== 创建测试投稿数据 ===\n');
    
    try {
        // 1. 使用普通用户登录创建投稿
        console.log('1. 用户登录并创建投稿...');
        const userLogin = await axios.post('http://localhost:9090/user/login', {
            username: 'zhanghui',
            password: '123456'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (userLogin.data && userLogin.data.code === 200) {
            const userToken = userLogin.data.data.token;
            console.log('✅ 用户登录成功\n');
            
            // 2. 创建几个测试投稿
            const sampleDisclosures = [
                {
                    title: 'iPhone 15 Pro Max 折扣信息',
                    content: '发现苹果官方商店iPhone 15 Pro Max有5%的折扣优惠，限时三天，建议尽快购买。',
                    link: 'https://www.apple.com/jp/shop/buy-iphone/iphone-15-pro',
                    disclosurePrice: 129800,
                    imgUrl: '/uploads/sample1.jpg',
                    status: 0  // 待审核
                },
                {
                    title: '任天堂Switch OLED 特价活动',
                    content: '亚马逊日本站Switch OLED主机正在特价销售，比官网便宜3000日元，包含免费游戏下载码。',
                    link: 'https://www.amazon.co.jp/Switch-OLED/dp/B09N5KJQ2G',
                    disclosurePrice: 34980,
                    imgUrl: '/uploads/sample2.jpg',
                    status: 0  // 待审核
                },
                {
                    title: '索尼WH-1000XM5 降噪耳机优惠',
                    content: '索尼官方旗舰店WH-1000XM5无线降噪耳机直降20%，现在是入手的最佳时机。',
                    link: 'https://store.sony.jp/products/WH-1000XM5',
                    disclosurePrice: 39800,
                    imgUrl: '/uploads/sample3.jpg',
                    status: 1  // 已公开
                }
            ];
            
            let createdCount = 0;
            for (const disclosure of sampleDisclosures) {
                try {
                    const response = await axios.post('http://localhost:9090/disclosure/add', disclosure, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userToken}`
                        },
                        timeout: 5000
                    });
                    
                    if (response.data && response.data.code === 200) {
                        console.log(`✅ 创建投稿成功: "${disclosure.title}"`);
                        createdCount++;
                    } else {
                        console.log(`❌ 创建投稿失败: "${disclosure.title}" - ${response.data?.msg}`);
                    }
                } catch (error) {
                    console.log(`❌ 创建投稿出错: "${disclosure.title}" - ${error.message}`);
                }
                
                // 添加延迟避免请求过快
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log(`\n总共创建了 ${createdCount} 个测试投稿\n`);
            
            // 3. 管理员登录检查数据
            console.log('2. 管理员检查投稿数据...');
            const adminLogin = await axios.post('http://localhost:9090/user/login', {
                username: 'testuser3',
                password: '123123'
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            
            if (adminLogin.data && adminLogin.data.code === 200) {
                const adminToken = adminLogin.data.data.token;
                
                // 检查各种状态的投稿
                const pendingRes = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                const publicRes = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                console.log('📊 投稿状态统计:');
                console.log(`   待审核: ${pendingRes.data?.data?.length || 0} 条`);
                console.log(`   已公开: ${publicRes.data?.data?.length || 0} 条`);
                console.log(`   总计: ${(pendingRes.data?.data?.length || 0) + (publicRes.data?.data?.length || 0)} 条`);
                
                if (pendingRes.data?.data?.length > 0) {
                    console.log('\n📋 待审核投稿列表:');
                    pendingRes.data.data.forEach((item, index) => {
                        console.log(`${index + 1}. "${item.title}" - ID: ${item.disclosureId}`);
                    });
                }
                
                if (publicRes.data?.data?.length > 0) {
                    console.log('\n📋 已公开投稿列表:');
                    publicRes.data.data.forEach((item, index) => {
                        console.log(`${index + 1}. "${item.title}" - ID: ${item.disclosureId}`);
                    });
                }
                
            } else {
                console.log('❌ 管理员登录失败');
            }
            
        } else {
            console.log('❌ 用户登录失败:', userLogin.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 操作失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// 执行创建测试数据
createSampleDisclosures();