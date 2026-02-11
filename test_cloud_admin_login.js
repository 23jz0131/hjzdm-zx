const axios = require('axios');

async function testCloudAdminLogin() {
    console.log('=== 测试云端管理员账户登录 ===\n');
    
    const adminCredentials = {
        username: 'testuser3',
        password: '123123'
    };
    
    console.log('测试账户信息:');
    console.log('- 用户名:', adminCredentials.username);
    console.log('- 密码:', adminCredentials.password);
    console.log('');
    
    try {
        console.log('🚀 尝试登录...');
        
        const response = await axios.post('http://localhost:9090/user/login', adminCredentials, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        console.log('\n=== 登录响应 ===');
        console.log('状态码:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.code === 200) {
            console.log('\n✅ 登录成功!');
            const token = response.data.data?.token;
            const userId = response.data.data?.id;
            
            if (token) {
                console.log('JWT Token:', token.substring(0, 50) + '...');
                console.log('用户ID:', userId);
                
                // 测试使用token获取用户信息
                await testUserInfoWithToken(token);
            }
        } else {
            console.log('\n❌ 登录失败');
            console.log('错误码:', response.data?.code);
            console.log('错误信息:', response.data?.msg || response.data?.message);
        }
        
    } catch (error) {
        console.log('\n=== 登录异常 ===');
        console.log('错误类型:', error.constructor.name);
        console.log('错误消息:', error.message);
        
        if (error.response) {
            console.log('响应状态码:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
        
        // 分析可能的原因
        console.log('\n🔍 可能的原因分析:');
        if (error.response?.data?.msg?.includes('用户名或密码错误')) {
            console.log('- 账户凭据不正确');
            console.log('- 可能是密码在云端数据库中存储格式不同');
        } else if (error.response?.status === 404) {
            console.log('- 登录接口不可用');
            console.log('- 后端服务可能未启动');
        } else {
            console.log('- 网络连接问题或其他系统错误');
        }
    }
}

async function testUserInfoWithToken(token) {
    console.log('\n--- 测试用户信息获取 ---');
    
    try {
        const response = await axios.post('http://localhost:9090/user/me', {}, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            timeout: 5000
        });
        
        console.log('用户信息响应:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('获取用户信息失败:', error.response?.data || error.message);
    }
}

// 执行测试
testCloudAdminLogin();