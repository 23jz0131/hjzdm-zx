const http = require('http');

console.log('🔍 测试后端服务重启状态...\n');

// 测试基本连接
const options = {
    hostname: 'localhost',
    port: 9090,
    path: '/goods/compare',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': 21
    }
};

const postData = JSON.stringify({
    query: 'Switch'
});

const req = http.request(options, (res) => {
    console.log(`📡 HTTP状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log('✅ 服务响应正常');
            console.log('📦 响应码:', jsonData.code);
            console.log('📊 返回商品组数:', jsonData.data ? jsonData.data.length : 0);
            
            if (jsonData.data && jsonData.data.length > 0) {
                // 统计平台分布
                let stats = {10: 0, 20: 0, 40: 0};
                jsonData.data.forEach(group => {
                    if (group.goodsList) {
                        group.goodsList.forEach(item => {
                            stats[item.mallType] = (stats[item.mallType] || 0) + 1;
                        });
                    }
                });
                
                console.log('📈 平台分布统计:');
                console.log(`   乐天市场 (10): ${stats[10]} 件`);
                console.log(`   Yahoo购物 (20): ${stats[20]} 件`);
                console.log(`   Amazon (40): ${stats[40]} 件`);
                
                if (stats[20] > 0) {
                    console.log('🎉 Yahoo商品搜索功能正常！');
                } else {
                    console.log('⚠️  Yahoo商品暂未返回，但服务运行正常');
                }
            }
            
        } catch (error) {
            console.error('❌ 响应解析失败:', error.message);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ 连接失败:', error.message);
    console.log('💡 请检查后端服务是否已启动');
});

req.write(postData);
req.end();

console.log('🚀 已发送测试请求...');