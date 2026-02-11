const axios = require('axios');

async function checkExistingUsers() {
    console.log('=== 检查现有用户数据 ===\n');
    
    // 先注册几个测试用户来了解系统行为
    const testUsers = [
        { username: 'testuser1', password: '123456' },
        { username: 'testuser2', password: '123456' },
        { username: 'admin', password: '123456' }
    ];
    
    console.log('1. 注册测试用户...');
    for (const user of testUsers) {
        try {
            await axios.post('http://localhost:9090/user/register', {
                username: user.username,
                email: `${user.username}@example.com`,
                password: user.password,
                confirmPassword: user.password
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            console.log(`✅ 成功注册: ${user.username}`);
        } catch (error) {
            if (error.response?.data?.msg?.includes('已存在')) {
                console.log(`⚠️  用户已存在: ${user.username}`);
            } else {
                console.log(`❌ 注册失败 ${user.username}:`, error.response?.data?.msg || error.message);
            }
        }
    }
    
    console.log('\n2. 测试所有用户的登录...');
    const allUsers = ['zhanghui', 'testuser1', 'testuser2', 'admin'];
    
    for (const username of allUsers) {
        console.log(`\n--- 测试用户: ${username} ---`);
        await testUserLogin(username, '123456');
    }
    
    console.log('\n3. 测试错误密码情况...');
    await testUserLogin('zhanghui', 'wrongpassword');
}

async function testUserLogin(username, password) {
    try {
        const response = await axios.post('http://localhost:9090/user/login', {
            username: username,
            password: password
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (response.data && response.data.code === 200) {
            console.log(`✅ 登录成功 - ${username}`);
            console.log(`   用户ID: ${response.data.data?.id}`);
            console.log(`   Token: ${response.data.data?.token?.substring(0, 30)}...`);
        } else {
            console.log(`❌ 登录失败 - ${username}: ${response.data?.msg}`);
        }
        
    } catch (error) {
        console.log(`❌ 登录异常 - ${username}: ${error.response?.data?.msg || error.message}`);
    }
}

// 执行检查
checkExistingUsers();