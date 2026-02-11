const http = require('http');

console.log('🔍 测试真实数据服务...\n');

// 测试商品比价API
function testCompareAPI() {
    console.log('🚀 测试商品比价API (/goods/compare)');
    
    const postData = JSON.stringify({
        query: 'iPhone 15'
    });

    const options = {
        hostname: 'localhost',
        port: 9090,
        path: '/goods/compare',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`📡 响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ 比价API测试成功');
                console.log(`📦 响应码: ${jsonData.code}`);
                console.log(`📊 商品组数: ${jsonData.data ? jsonData.data.length : 0}`);
                
                if (jsonData.data && jsonData.data.length > 0) {
                    const group = jsonData.data[0];
                    console.log(`\n🛒 商品组: ${group.goodsName}`);
                    console.log(`💰 最低价格: ¥${group.lowestPrice}`);
                    console.log(`🏪 最低平台: ${group.lowestPlatform}`);
                    console.log(`📱 商品数量: ${group.goodsList ? group.goodsList.length : 0}`);
                    
                    // 显示前3个商品
                    if (group.goodsList && group.goodsList.length > 0) {
                        console.log('\n📋 前3个商品:');
                        group.goodsList.slice(0, 3).forEach((item, index) => {
                            const platform = item.mallType === 10 ? '乐天' : 
                                           item.mallType === 20 ? 'Yahoo' : 
                                           item.mallType === 40 ? 'Amazon' : '其他';
                            console.log(`  ${index + 1}. ${item.goodsName}`);
                            console.log(`     价格: ¥${item.goodsPrice}`);
                            console.log(`     平台: ${platform}`);
                            console.log(`     链接: ${item.goodsLink}`);
                        });
                    }
                }
            } catch (error) {
                console.error('❌ 响应解析失败:', error.message);
                console.log('原始数据:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
}

// 测试用户信息API
function testUserInfoAPI() {
    console.log('\n👤 测试用户信息API (/user/me)');
    
    const options = {
        hostname: 'localhost',
        port: 9090,
        path: '/user/me',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`📡 响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ 用户信息API测试成功');
                console.log(`📦 响应码: ${jsonData.code}`);
                
                if (jsonData.data) {
                    console.log('\n📋 用户信息:');
                    console.log(`  ID: ${jsonData.data.id}`);
                    console.log(`  用户名: ${jsonData.data.username}`);
                    console.log(`  昵称: ${jsonData.data.nickname}`);
                    console.log(`  邮箱: ${jsonData.data.email}`);
                    console.log(`  角色: ${jsonData.data.role}`);
                }
            } catch (error) {
                console.error('❌ 响应解析失败:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ 请求失败:', error.message);
    });

    req.end();
}

// 测试商品搜索API
function testSearchAPI() {
    console.log('\n🔍 测试商品搜索API (/goods/search)');
    
    const postData = JSON.stringify({
        query: '笔记本电脑'
    });

    const options = {
        hostname: 'localhost',
        port: 9090,
        path: '/goods/search',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`📡 响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ 搜索API测试成功');
                console.log(`📦 响应码: ${jsonData.code}`);
                console.log(`📊 商品数量: ${jsonData.data ? jsonData.data.length : 0}`);
                
                if (jsonData.data && jsonData.data.length > 0) {
                    console.log('\n📋 搜索结果 (前3个):');
                    jsonData.data.slice(0, 3).forEach((item, index) => {
                        const platform = item.mallType === 10 ? '乐天' : 
                                       item.mallType === 20 ? 'Yahoo' : 
                                       item.mallType === 40 ? 'Amazon' : '其他';
                        console.log(`  ${index + 1}. ${item.goodsName}`);
                        console.log(`     价格: ¥${item.goodsPrice}`);
                        console.log(`     平台: ${platform}`);
                    });
                }
            } catch (error) {
                console.error('❌ 响应解析失败:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
}

// 执行所有测试
setTimeout(testCompareAPI, 1000);
setTimeout(testUserInfoAPI, 2000);
setTimeout(testSearchAPI, 3000);

console.log('💡 测试将在几秒钟内依次执行...\n');