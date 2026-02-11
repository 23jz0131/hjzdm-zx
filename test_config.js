const http = require('http');

// 测试配置端点
function testConfig() {
    console.log('🔧 测试系统配置...\n');
    
    const options = {
        hostname: 'localhost',
        port: 9090,
        path: '/test/config',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                console.log('响应内容:', data);
            } catch (error) {
                console.error('解析失败:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('请求失败:', error.message);
    });

    req.end();
}

// 如果没有配置端点，直接测试比价功能
function testDirect() {
    console.log('🔍 直接测试比价功能配置...\n');
    
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
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ 成功接收响应');
                // 不需要解析具体内容，只要能收到响应就说明服务正常
            } catch (error) {
                console.error('❌ 解析失败:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
}

// 执行测试
testDirect();