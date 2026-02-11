const http = require('http');

console.log('🔍 正在检查服务状态...\n');

// 测试后端服务
const backendOptions = {
  hostname: 'localhost',
  port: 9090,
  path: '/user/me',
  method: 'GET'
};

const backendReq = http.request(backendOptions, (res) => {
  console.log(`✅ 后端服务 (端口9090): 运行中`);
  console.log(`   状态码: ${res.statusCode}`);
});

backendReq.on('error', (err) => {
  console.log(`❌ 后端服务 (端口9090): 未运行`);
  console.log(`   错误: ${err.message}`);
});

backendReq.end();

// 测试前端服务
const frontendOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
};

const frontendReq = http.request(frontendOptions, (res) => {
  console.log(`✅ 前端服务 (端口3000): 运行中`);
  console.log(`   状态码: ${res.statusCode}`);
});

frontendReq.on('error', (err) => {
  console.log(`❌ 前端服务 (端口3000): 未运行`);
  console.log(`   错误: ${err.message}`);
});

frontendReq.end();

setTimeout(() => {
  console.log('\n📋 重启完成！');
  console.log('🌐 前端访问地址: http://localhost:3000');
  console.log('🔧 后端API地址: http://localhost:9090');
}, 2000);