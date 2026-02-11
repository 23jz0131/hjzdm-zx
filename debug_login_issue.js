const axios = require('axios');

async function debugLoginIssue() {
    console.log('=== 详细调试登录问题 ===\n');
    
    // 1. 先检查数据库连接和用户表状态
    console.log('1. 检查数据库状态...');
    try {
        const dbTestResponse = await axios.get('http://localhost:9090/database-test/status', {
            timeout: 5000
        });
        console.log('数据库状态:', dbTestResponse.data);
    } catch (error) {
        console.log('数据库测试接口不可用:', error.message);
    }
    
    // 2. 尝试注册用户zhanghui
    console.log('\n2. 尝试注册zhanghui用户...');
    const registerData = {
        username: 'zhanghui',
        email: 'zhanghui@example.com',
        password: '123456',
        confirmPassword: '123456'
    };
    
    try {
        const registerResponse = await axios.post('http://localhost:9090/user/register', registerData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        console.log('注册响应状态:', registerResponse.status);
        console.log('注册响应数据:', JSON.stringify(registerResponse.data, null, 2));
        
        if (registerResponse.data && registerResponse.data.code === 200) {
            console.log('✅ 用户注册成功!');
            await testLoginProcess('zhanghui', '123456');
        } else {
            console.log('注册失败，可能是用户已存在，直接测试登录...');
            await testLoginProcess('zhanghui', '123456');
        }
        
    } catch (registerError) {
        if (registerError.response?.data?.msg?.includes('已存在')) {
            console.log('用户 "zhanghui" 已存在，直接测试登录...');
            await testLoginProcess('zhanghui', '123456');
        } else {
            console.log('注册异常:', registerError.response?.data || registerError.message);
            // 即使注册失败也尝试登录
            await testLoginProcess('zhanghui', '123456');
        }
    }
}

async function testLoginProcess(username, password) {
    console.log('\n3. 测试登录流程...');
    
    const loginData = {
        username: username,
        password: password
    };
    
    try {
        console.log(`尝试登录用户: ${username}`);
        console.log(`密码: ${password}`);
        
        const loginResponse = await axios.post('http://localhost:9090/user/login', loginData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        console.log('\n=== 登录响应详情 ===');
        console.log('状态码:', loginResponse.status);
        console.log('响应头:', loginResponse.headers);
        console.log('响应数据:', JSON.stringify(loginResponse.data, null, 2));
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录成功!');
            const token = loginResponse.data.data?.token;
            if (token) {
                console.log('JWT Token:', token.substring(0, 50) + '...');
                // 测试使用token获取用户信息
                await testTokenUsage(token);
            }
        } else {
            console.log('❌ 登录失败');
            console.log('错误码:', loginResponse.data?.code);
            console.log('错误信息:', loginResponse.data?.msg || loginResponse.data?.message);
        }
        
    } catch (loginError) {
        console.log('\n=== 登录异常详情 ===');
        console.log('错误类型:', loginError.constructor.name);
        console.log('错误消息:', loginError.message);
        
        if (loginError.response) {
            console.log('响应状态码:', loginError.response.status);
            console.log('响应数据:', JSON.stringify(loginError.response.data, null, 2));
            console.log('响应头:', loginError.response.headers);
        }
        
        if (loginError.request) {
            console.log('请求详情:', loginError.request);
        }
    }
}

async function testTokenUsage(token) {
    console.log('\n4. 测试Token使用...');
    
    try {
        const profileResponse = await axios.post('http://localhost:9090/user/me', {}, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            timeout: 5000
        });
        
        console.log('用户信息响应:', JSON.stringify(profileResponse.data, null, 2));
        
    } catch (error) {
        console.log('获取用户信息失败:', error.response?.data || error.message);
    }
}

// 执行调试
debugLoginIssue();