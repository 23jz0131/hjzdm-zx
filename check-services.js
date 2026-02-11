// 服务状态检查脚本
const http = require('http');

console.log('🔍 检查服务状态...\n');

// 检查后端服务 (9090端口)
const backendCheck = new Promise((resolve) => {
    const req = http.get('http://localhost:9090/health', (res) => {
        console.log('✅ 后端服务 (9090端口): 运行中');
        resolve(true);
    }).on('error', () => {
        console.log('❌ 后端服务 (9090端口): 未运行');
        resolve(false);
    });
    
    req.setTimeout(3000, () => {
        req.destroy();
        console.log('❌ 后端服务 (9090端口): 超时');
        resolve(false);
    });
});

// 检查前端服务 (3000端口)
const frontendCheck = new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
        console.log('✅ 前端服务 (3000端口): 运行中');
        resolve(true);
    }).on('error', () => {
        console.log('❌ 前端服务 (3000端口): 未运行');
        resolve(false);
    });
    
    req.setTimeout(3000, () => {
        req.destroy();
        console.log('❌ 前端服务 (3000端口): 超时');
        resolve(false);
    });
});

Promise.all([backendCheck, frontendCheck]).then(([backendStatus, frontendStatus]) => {
    console.log('\n📋 服务状态汇总:');
    console.log('===================');
    console.log(`后端服务: ${backendStatus ? '🟢 运行中' : '🔴 未运行'}`);
    console.log(`前端服务: ${frontendStatus ? '🟢 运行中' : '🔴 未运行'}`);
    
    if (backendStatus && frontendStatus) {
        console.log('\n🎉 所有服务均已正常运行!');
        console.log('🌐 前端访问地址: http://localhost:3000');
        console.log('🖥️  后端API地址: http://localhost:9090');
    } else {
        console.log('\n⚠️  部分服务未运行，请手动启动相应服务');
    }
});