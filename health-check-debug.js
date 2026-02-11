const axios = require('axios');

async function testHealthEndpoints() {
    const baseUrl = 'http://localhost:9090';
    
    console.log('🔍 健康检查端点测试\n');
    
    const endpoints = [
        '/actuator/health',
        '/api/test',
        '/',
        '/index.html'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`_testing ${baseUrl}${endpoint}...`);
            const response = await axios.get(`${baseUrl}${endpoint}`, {
                timeout: 5000,
                validateStatus: () => true // 接受所有状态码
            });
            
            console.log(`✅ ${endpoint}: ${response.status} (${response.statusText})`);
            console.log(`   Content-Type: ${response.headers['content-type'] || 'unknown'}`);
            console.log(`   Content-Length: ${response.headers['content-length'] || 'unknown'}`);
            
            if (endpoint === '/actuator/health') {
                console.log(`   Response body: ${JSON.stringify(response.data)}`);
            }
            
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
        console.log('');
    }
}

// 模拟Render健康检查请求
async function simulateRenderHealthCheck() {
    console.log('🔄 模拟Render健康检查请求\n');
    
    try {
        const response = await axios.get('http://localhost:9090/actuator/health', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Render/1.0',
                'Host': 'hjzdm-zx.onrender.com'
            }
        });
        
        console.log(`✅ 健康检查成功: ${response.status}`);
        console.log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);
        
    } catch (error) {
        console.log(`❌ 健康检查失败: ${error.message}`);
        if (error.response) {
            console.log(`状态码: ${error.response.status}`);
            console.log(`响应头: ${JSON.stringify(error.response.headers, null, 2)}`);
        }
    }
}

// 运行测试
async function runAllTests() {
    await testHealthEndpoints();
    await simulateRenderHealthCheck();
}

runAllTests().catch(console.error);