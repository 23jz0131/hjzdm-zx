const http = require('http');

console.log('=== 修正后的用户API测试 ===\n');

// 测试用户信息API (POST方法)
function testUserInfo() {
    const postData = JSON.stringify({});
    
    const options = {
        hostname: 'localhost',
        port: 9090,
        path: '/user/me',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('👤 用户信息API测试结果 (POST方法):');
            console.log('状态码:', res.statusCode);
            try {
                const jsonData = JSON.parse(data);
                console.log('响应数据:', JSON.stringify(jsonData, null, 2));
                console.log('✅ 用户API测试完成\n');
            } catch (e) {
                console.log('原始响应:', data);
                console.log('❌ JSON解析失败\n');
            }
        });
    });

    req.on('error', (error) => {
        console.log('👤 用户信息API错误:', error.message);
        console.log('❌ 用户API测试失败\n');
    });

    req.write(postData);
    req.end();
}

// 执行测试
testUserInfo();