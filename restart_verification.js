const axios = require('axios');

async function checkRestartStatus() {
    console.log('=== 服务重启状态检查 ===\n');
    
    // 检查后端服务
    try {
        console.log('1. 检查后端服务 (9090端口)...');
        const backendResponse = await axios.get('http://localhost:9090/health', { timeout: 3000 });
        console.log('✅ 后端服务运行正常');
    } catch (error) {
        console.log('❌ 后端服务异常:', error.message);
    }
    
    // 检查前端服务
    try {
        console.log('\n2. 检查前端服务 (3000端口)...');
        const frontendResponse = await axios.get('http://localhost:3000', { timeout: 3000 });
        console.log('✅ 前端服务运行正常');
    } catch (error) {
        console.log('❌ 前端服务异常:', error.message);
    }
    
    // 测试核心功能
    try {
        console.log('\n3. 测试核心功能...');
        
        // 测试登录
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录功能正常');
            
            // 测试用户信息
            const token = loginResponse.data.data.token;
            const userInfo = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (userInfo.data && userInfo.data.code === 200) {
                console.log('✅ 用户信息接口正常');
                console.log('   昵称支持:', userInfo.data.data.nickname !== undefined ? '✅' : '❌');
            }
        }
        
        // 测试真实姓名账户
        const zhanghuiLogin = await axios.post('http://localhost:9090/user/login', {
            username: 'zhanghui',
            password: '123123'
        });
        
        if (zhanghuiLogin.data && zhanghuiLogin.data.code === 200) {
            console.log('✅ 真实姓名账户正常');
        }
        
    } catch (error) {
        console.log('❌ 功能测试失败:', error.message);
    }
    
    console.log('\n=== 重启完成 ===');
    console.log('请访问 http://localhost:3000 进行测试');
}

checkRestartStatus();