const http = require('http');

console.log('🔍 测试前端服务启动状态...\n');

// 测试3000端口连接
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`📡 HTTP状态码: ${res.statusCode}`);
    console.log('✅ 前端服务启动成功！');
    console.log('🌐 访问地址: http://localhost:3000');
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('📄 页面标题:', data.includes('<title>') ? 
            data.match(/<title>(.*?)<\/title>/)[1] : '未知');
    });
});

req.on('error', (error) => {
    console.error('❌ 连接失败:', error.message);
    console.log('💡 前端服务可能还在启动中，请稍候...');
});

req.end();

setTimeout(() => {
    console.log('⏰ 测试完成');
}, 3000);