const axios = require('axios');

async function checkServiceStatus() {
    console.log('=== 服务重启状态检查 ===\n');
    
    // 检查后端服务
    try {
        console.log('1. 检查后端服务 (9090端口)...');
        const backendHealth = await axios.get('http://localhost:9090/health', { timeout: 3000 });
        console.log('✅ 后端服务运行正常\n');
    } catch (error) {
        console.log('❌ 后端服务异常:', error.message, '\n');
    }
    
    // 检查前端服务
    try {
        console.log('2. 检查前端服务 (3000端口)...');
        const frontendCheck = await axios.get('http://localhost:3000', { timeout: 3000 });
        console.log('✅ 前端服务运行正常\n');
    } catch (error) {
        console.log('❌ 前端服务异常:', error.message, '\n');
    }
    
    // 测试核心功能
    try {
        console.log('3. 测试用户登录功能...');
        const loginTest = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        });
        
        if (loginTest.data && loginTest.data.code === 200) {
            console.log('✅ 用户登录功能正常');
            console.log('   Token获取成功\n');
            
            // 测试用户信息接口
            const token = loginTest.data.data.token;
            const userInfo = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (userInfo.data && userInfo.data.code === 200) {
                console.log('✅ 用户信息接口正常');
                console.log('   昵称字段:', userInfo.data.data.nickname !== undefined ? '✅ 存在' : '❌ 缺失');
                console.log('   当前昵称:', userInfo.data.data.nickname || '未设置\n');
            }
        }
    } catch (error) {
        console.log('❌ 核心功能测试失败:', error.message, '\n');
    }
    
    console.log('=== 重启完成 ===');
    console.log('请访问 http://localhost:3000 进行测试');
}

checkServiceStatus();