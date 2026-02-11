const http = require('http');

console.log('正在测试8080端口配置...');

// 测试前端代理配置
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/user/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`前端代理状态码: ${res.statusCode}`);
  console.log('✅ 前端代理配置正确');
  
  res.on('data', (chunk) => {
    console.log('响应数据:', chunk.toString());
  });
});

req.on('error', (error) => {
  console.log('❌ 前端代理测试失败:', error.message);
  console.log('请确保前端开发服务器已在3000端口运行');
});

// 发送测试数据
req.write(JSON.stringify({
  username: 'test',
  password: 'test'
}));
req.end();

// 测试后端直接连接
setTimeout(() => {
  const backendOptions = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/user/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const backendReq = http.request(backendOptions, (res) => {
    console.log(`\n后端直接连接状态码: ${res.statusCode}`);
    console.log('✅ 后端8080端口配置正确');
  });

  backendReq.on('error', (error) => {
    console.log('\n❌ 后端8080端口连接失败:', error.message);
    console.log('请确保后端服务已在8080端口运行');
  });

  backendReq.write(JSON.stringify({
    username: 'test',
    password: 'test'
  }));
  backendReq.end();
}, 2000);