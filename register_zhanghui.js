const axios = require('axios');

async function registerSimpleUser() {
    console.log('=== 注册简单用户名账户 ===\n');
    
    const userData = {
        username: 'zhanghui',  // 张辉
        email: 'zhanghui@example.com',
        password: '123456',
        confirmPassword: '123456'
    };
    
    console.log('注册信息:');
    console.log('- 用户名:', userData.username);
    console.log('- 邮箱:', userData.email);
    console.log('- 密码: 123456\n');
    
    try {
        const response = await axios.post('http://localhost:9090/user/register', userData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        if (response.data && response.data.code === 200) {
            console.log('🎉 注册成功!');
            console.log('=== 登录信息 ===');
            console.log('用户名:', userData.username);
            console.log('密码: 123456');
            console.log('现在您可以使用张辉的账户登录系统了!');
            
            // 测试登录
            await testLogin(userData.username, userData.password);
        } else {
            console.log('注册失败:', response.data?.msg);
        }
        
    } catch (error) {
        if (error.response?.data?.msg?.includes('已存在')) {
            console.log('用户 "zhanghui" 已存在，直接测试登录...');
            await testLogin(userData.username, userData.password);
        } else {
            console.log('注册失败:', error.message);
        }
    }
}

async function testLogin(username, password) {
    const loginData = { username, password };
    
    try {
        const response = await axios.post('http://localhost:9090/user/login', loginData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        if (response.data && response.data.code === 200) {
            console.log('✅ 登录测试成功!');
            console.log('JWT Token:', response.data.data?.token?.substring(0, 50) + '...');
        }
    } catch (error) {
        console.log('登录测试失败:', error.response?.data?.msg || error.message);
    }
}

// 执行注册
registerSimpleUser();