const axios = require('axios');

async function registerNewUser() {
    console.log('=== 注册新用户 ===\n');
    
    // 生成随机用户名避免冲突
    const timestamp = Date.now();
    const userData = {
        username: `user_${timestamp}`,
        email: `user_${timestamp}@example.com`,
        password: '123456',
        confirmPassword: '123456'
    };
    
    console.log('注册信息:');
    console.log('- 用户名:', userData.username);
    console.log('- 邮箱:', userData.email);
    console.log('- 密码: 123456');
    console.log('- 确认密码: 123456\n');
    
    try {
        console.log('发送注册请求到: http://localhost:9090/user/register');
        
        const response = await axios.post('http://localhost:9090/user/register', userData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('\n✅ 注册请求成功!');
        console.log('响应状态码:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.code === 200) {
            console.log('\n🎉 注册成功!');
            console.log('用户信息:');
            console.log('- 用户ID:', response.data.data?.id);
            console.log('- 用户名:', response.data.data?.name);
            console.log('- OpenID:', response.data.data?.openid);
            console.log('- 创建时间:', response.data.data?.createTime);
            
            console.log('\n=== 登录信息 ===');
            console.log('用户名:', userData.username);
            console.log('密码: 123456');
            console.log('现在您可以使用这个账户登录系统了!');
            
            // 测试登录
            await testLogin(userData.username, userData.password);
        } else {
            console.log('\n❌ 注册失败:', response.data?.msg || '未知错误');
        }
        
    } catch (error) {
        console.log('\n❌ 注册请求失败:');
        if (error.response) {
            console.log('状态码:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('网络错误: 无法连接到服务器');
            console.log('请检查后端服务是否在运行 (端口9090)');
        } else {
            console.log('错误信息:', error.message);
        }
    }
}

async function testLogin(username, password) {
    console.log('\n=== 测试登录 ===');
    
    const loginData = {
        username: username,
        password: password
    };
    
    try {
        console.log('使用新注册的账户测试登录...');
        
        const response = await axios.post('http://localhost:9090/user/login', loginData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('登录响应状态:', response.status);
        console.log('登录响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.code === 200) {
            console.log('✅ 登录测试成功!');
            const token = response.data.data?.token;
            if (token) {
                console.log('JWT Token:', token.substring(0, 50) + '...');
            }
        } else {
            console.log('❌ 登录测试失败:', response.data?.msg || '未知错误');
        }
        
    } catch (error) {
        console.log('登录测试失败:', error.message);
    }
}

// 执行注册
registerNewUser();