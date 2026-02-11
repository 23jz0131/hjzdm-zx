const axios = require('axios');

// 测试常见用户名的登录
const testAccounts = [
    'zhanghui',
    'testuser3', 
    'admin',
    'user_1770609366791'
];

async function checkExistingAccounts() {
    console.log('=== 检查现有账户登录 ===\n');
    
    for (const username of testAccounts) {
        console.log(`测试账户: ${username}`);
        const loginData = {
            username: username,
            password: '123456'
        };
        
        try {
            const response = await axios.post('http://localhost:9090/user/login', loginData, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            
            if (response.data && response.data.code === 200) {
                console.log(`✅ 登录成功! 用户名: ${username}`);
                console.log(`   Token: ${response.data.data?.token?.substring(0, 30)}...`);
                return { username, success: true };
            } else {
                console.log(`❌ 登录失败: ${response.data?.msg || '未知错误'}`);
            }
        } catch (error) {
            if (error.response) {
                console.log(`❌ 登录失败 (${error.response.status}): ${error.response.data?.msg || '服务器错误'}`);
            } else {
                console.log(`❌ 网络错误: ${error.message}`);
            }
        }
        console.log('---');
    }
    
    return { username: null, success: false };
}

// 测试自定义用户名注册和登录
async function testCustomRegistration(customUsername) {
    console.log(`\n=== 测试自定义用户名注册: ${customUsername} ===`);
    
    const registerData = {
        username: customUsername,
        email: `${customUsername}@example.com`,
        password: '123456',
        confirmPassword: '123456'
    };
    
    try {
        // 先尝试注册
        const registerResponse = await axios.post('http://localhost:9090/user/register', registerData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (registerResponse.data && registerResponse.data.code === 200) {
            console.log(`✅ 注册成功! 用户名: ${customUsername}`);
            
            // 立即测试登录
            const loginData = {
                username: customUsername,
                password: '123456'
            };
            
            const loginResponse = await axios.post('http://localhost:9090/user/login', loginData, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            
            if (loginResponse.data && loginResponse.data.code === 200) {
                console.log(`✅ 登录测试成功!`);
                console.log(`   Token: ${loginResponse.data.data?.token?.substring(0, 30)}...`);
                return { username: customUsername, success: true };
            }
        } else {
            console.log(`❌ 注册失败: ${registerResponse.data?.msg}`);
        }
    } catch (error) {
        if (error.response?.data?.msg?.includes('已存在')) {
            console.log(`用户 "${customUsername}" 已存在，直接测试登录...`);
            return await testDirectLogin(customUsername);
        } else {
            console.log(`❌ 操作失败: ${error.response?.data?.msg || error.message}`);
        }
    }
    
    return { username: null, success: false };
}

async function testDirectLogin(username) {
    const loginData = {
        username: username,
        password: '123456'
    };
    
    try {
        const response = await axios.post('http://localhost:9090/user/login', loginData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (response.data && response.data.code === 200) {
            console.log(`✅ 登录成功! 用户名: ${username}`);
            console.log(`   Token: ${response.data.data?.token?.substring(0, 30)}...`);
            return { username, success: true };
        } else {
            console.log(`❌ 登录失败: ${response.data?.msg}`);
        }
    } catch (error) {
        console.log(`❌ 登录失败: ${error.response?.data?.msg || error.message}`);
    }
    
    return { username: null, success: false };
}

// 主测试函数
async function diagnoseLoginIssue() {
    console.log('开始诊断登录问题...\n');
    
    // 1. 测试现有账户
    const existingResult = await checkExistingAccounts();
    if (existingResult.success) {
        console.log(`\n🎉 找到可登录账户: ${existingResult.username}`);
        console.log('请使用此账户在前端登录页面测试');
        return;
    }
    
    // 2. 如果您想测试特定的用户名，请在这里修改
    const customUsername = 'myaccount'; // 您可以修改为您想要的用户名
    
    console.log(`\n创建新的测试账户: ${customUsername}`);
    const customResult = await testCustomRegistration(customUsername);
    
    if (customResult.success) {
        console.log(`\n🎉 新账户创建成功!`);
        console.log(`登录信息:`);
        console.log(`- 用户名: ${customResult.username}`);
        console.log(`- 密码: 123456`);
        console.log(`请使用此信息在前端登录页面测试`);
    } else {
        console.log(`\n❌ 未能创建可用账户`);
        console.log('建议检查:');
        console.log('1. 后端服务是否正常运行 (端口9090)');
        console.log('2. 数据库连接是否正常');
        console.log('3. 前端代理配置是否正确');
    }
}

// 执行诊断
diagnoseLoginIssue();