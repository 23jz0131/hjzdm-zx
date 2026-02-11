const axios = require('axios');

async function checkServices() {
    console.log('=== 服务状态检查 ===\n');
    
    // 检查后端服务 (9090端口)
    try {
        console.log('1. 检查后端服务 (9090端口)...');
        const backendResponse = await axios.get('http://localhost:9090/health', { timeout: 3000 });
        console.log('✅ 后端服务运行正常');
        console.log('   响应状态:', backendResponse.status);
    } catch (error) {
        console.log('❌ 后端服务异常:', error.message);
    }
    
    // 检查前端服务 (3000端口)
    try {
        console.log('\n2. 检查前端服务 (3000端口)...');
        const frontendResponse = await axios.get('http://localhost:3000', { timeout: 3000 });
        console.log('✅ 前端服务运行正常');
        console.log('   响应状态:', frontendResponse.status);
    } catch (error) {
        console.log('❌ 前端服务异常:', error.message);
    }
    
    // 测试API接口
    try {
        console.log('\n3. 测试用户登录API...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        }, { timeout: 5000 });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 用户登录接口正常');
            console.log('   返回token长度:', loginResponse.data.data?.token?.length || 0);
        } else {
            console.log('❌ 用户登录接口异常:', loginResponse.data?.msg || '未知错误');
        }
    } catch (error) {
        console.log('❌ 用户登录接口调用失败:', error.message);
    }
    
    console.log('\n=== 检查完成 ===');
}

checkServices();