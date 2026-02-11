const http = require('http');

console.log('=== 最终配置验证测试 ===\n');

// 测试前端代理配置
function testFrontendProxy() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/user/me',
        method: 'POST',
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
            console.log('🌐 前端代理测试结果:');
            console.log('状态码:', res.statusCode);
            console.log('响应数据:', data);
            if (res.statusCode === 200) {
                console.log('✅ 前端代理配置正确 - 请求被正确转发到后端8080端口\n');
            } else {
                console.log('❌ 前端代理配置可能有问题\n');
            }
        });
    });

    req.on('error', (error) => {
        console.log('🌐 前端代理测试错误:', error.message);
        console.log('❌ 前端代理可能未启动\n');
    });

    req.write(JSON.stringify({}));
    req.end();
}

// 测试后端直接连接
function testBackendDirect() {
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/user/me',
        method: 'POST',
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
            console.log('🖥️ 后端直接连接测试结果:');
            console.log('状态码:', res.statusCode);
            console.log('响应数据:', data);
            if (res.statusCode === 200) {
                console.log('✅ 后端服务正常运行在8080端口\n');
            } else {
                console.log('❌ 后端服务可能有问题\n');
            }
        });
    });

    req.on('error', (error) => {
        console.log('🖥️ 后端直接连接测试错误:', error.message);
        console.log('❌ 后端服务未启动或端口被占用\n');
    });

    req.write(JSON.stringify({}));
    req.end();
}

// 执行测试
setTimeout(testFrontendProxy, 1000);
setTimeout(testBackendDirect, 2000);

console.log('请在浏览器中访问 http://localhost:3000 验证页面是否正常加载\n');
console.log('检查浏览器开发者工具的Network标签页，确认API请求发送到 localhost:3000 而不是 9090\n');