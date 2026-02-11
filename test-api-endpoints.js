const http = require('http');

console.log('=== API端点测试 ===\n');

// 测试分类列表API
function testCategoryList() {
    const postData = JSON.stringify({});
    
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/category/list',
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
            console.log('📁 分类列表API测试结果:');
            console.log('状态码:', res.statusCode);
            try {
                const jsonData = JSON.parse(data);
                console.log('响应数据:', JSON.stringify(jsonData, null, 2));
                console.log('✅ 分类API测试完成\n');
            } catch (e) {
                console.log('原始响应:', data);
                console.log('❌ JSON解析失败\n');
            }
        });
    });

    req.on('error', (error) => {
        console.log('📁 分类列表API错误:', error.message);
        console.log('❌ 分类API测试失败\n');
    });

    req.write(postData);
    req.end();
}

// 测试用户信息API
function testUserInfo() {
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/user/me',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('👤 用户信息API测试结果:');
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

    req.end();
}

// 测试商品比较API
function testGoodsCompare() {
    const postData = JSON.stringify({
        query: 'iPhone',
        pageNum: 1,
        pageSize: 10
    });
    
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/goods/compare',
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
            console.log('📱 商品比较API测试结果:');
            console.log('状态码:', res.statusCode);
            try {
                const jsonData = JSON.parse(data);
                console.log('响应数据长度:', data.length);
                console.log('响应数据预览:', data.substring(0, 200) + '...');
                console.log('✅ 商品比较API测试完成\n');
            } catch (e) {
                console.log('原始响应:', data);
                console.log('❌ JSON解析失败\n');
            }
        });
    });

    req.on('error', (error) => {
        console.log('📱 商品比较API错误:', error.message);
        console.log('❌ 商品比较API测试失败\n');
    });

    req.write(postData);
    req.end();
}

// 执行测试
setTimeout(testCategoryList, 1000);
setTimeout(testUserInfo, 2000);
setTimeout(testGoodsCompare, 3000);