const http = require('http');

// 测试Yahoo配置状态
function testYahooStatus() {
    console.log('🔍 测试Yahoo配置状态...\n');
    
    // 发送一个简单的请求来触发后端日志
    const postData = JSON.stringify({
        query: 'test'
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
        console.log(`状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('✅ 请求完成');
        });
    });

    req.on('error', (error) => {
        console.error('❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
    
    // 等待几秒让后端处理完毕，然后检查日志
    setTimeout(() => {
        console.log('\n📋 请检查后端日志中是否包含:');
        console.log('   - "Yahoo Enabled 状态: true"');
        console.log('   - "Yahoo搜索条件满足，准备执行搜索"');
        console.log('   - "Yahoo 商品検索を開始"');
    }, 3000);
}

// 执行测试
testYahooStatus();