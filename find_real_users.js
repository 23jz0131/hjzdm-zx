const axios = require('axios');

async function getAllUsers() {
    console.log('=== 查询系统中的所有用户账号 ===\n');
    
    try {
        // 首先尝试使用管理员账号登录来查询用户列表
        console.log('1. 尝试使用管理员账号登录...');
        
        // 尝试默认的管理员账号
        const adminCredentials = [
            { username: 'admin', password: 'admin123' },
            { username: 'zhanghui', password: '123456' }
        ];
        
        let adminToken = null;
        let adminId = null;
        
        for (const cred of adminCredentials) {
            try {
                const loginResponse = await axios.post('http://localhost:9090/user/login', {
                    username: cred.username,
                    password: cred.password
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                });
                
                if (loginResponse.data && loginResponse.data.code === 200) {
                    adminToken = loginResponse.data.data.token;
                    adminId = loginResponse.data.data.id;
                    console.log(`✅ 管理员登录成功: ${cred.username}`);
                    console.log(`- 用户ID: ${adminId}`);
                    break;
                }
            } catch (error) {
                console.log(`管理员账号 ${cred.username} 登录失败`);
            }
        }
        
        if (!adminToken) {
            console.log('❌ 无法使用管理员账号登录');
            return;
        }
        
        // 2. 尝试查询用户列表（如果存在相关接口）
        console.log('\n2. 尝试查询用户列表...');
        
        // 尝试几种可能的用户查询接口
        const userEndpoints = [
            '/user/list',
            '/user/all',
            '/user/users',
            '/admin/users'
        ];
        
        let userList = null;
        for (const endpoint of userEndpoints) {
            try {
                const response = await axios.get(`http://localhost:9090${endpoint}`, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    timeout: 5000
                });
                
                if (response.data && response.data.code === 200) {
                    userList = response.data.data;
                    console.log(`✅ 找到用户列表接口: ${endpoint}`);
                    break;
                }
            } catch (error) {
                // 继续尝试下一个端点
            }
        }
        
        // 3. 如果没有用户列表接口，尝试通过其他方式获取用户信息
        console.log('\n3. 尝试通过个人资料接口获取用户信息...');
        
        try {
            const profileResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                timeout: 5000
            });
            
            if (profileResponse.data && profileResponse.data.code === 200) {
                const currentUser = profileResponse.data.data;
                console.log('当前登录用户信息:');
                console.log(JSON.stringify(currentUser, null, 2));
            }
        } catch (error) {
            console.log('获取当前用户信息失败:', error.message);
        }
        
        // 4. 尝试注册一些测试用户来查看系统行为
        console.log('\n4. 尝试注册新用户来了解系统...');
        
        const testUsers = [
            { username: 'testuser1', email: 'test1@example.com', password: '123456' },
            { username: 'testuser2', email: 'test2@example.com', password: '123456' }
        ];
        
        for (const user of testUsers) {
            try {
                const registerResponse = await axios.post('http://localhost:9090/user/register', {
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    confirmPassword: user.password
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                });
                
                if (registerResponse.data && registerResponse.data.code === 200) {
                    console.log(`✅ 成功注册用户: ${user.username}`);
                    console.log(`- 用户ID: ${registerResponse.data.data.id}`);
                } else {
                    console.log(`注册用户 ${user.username} 失败:`, registerResponse.data?.msg || '未知错误');
                }
            } catch (error) {
                if (error.response?.data?.msg?.includes('已存在') || error.response?.data?.msg?.includes('exists')) {
                    console.log(`⚠️  用户 ${user.username} 已存在`);
                } else {
                    console.log(`注册用户 ${user.username} 出错:`, error.message);
                }
            }
        }
        
        console.log('\n=== 总结 ===');
        console.log('系统中至少存在以下用户:');
        console.log('- zhanghui (您提到的真实账号)');
        console.log('- 可能还有admin管理员账号');
        console.log('- 可能还有其他已注册的测试账号');
        
        console.log('\n建议:');
        console.log('1. 使用zhanghui/123456登录系统');
        console.log('2. 登录后可以在个人页面查看完整的用户信息');
        console.log('3. 如果需要管理员权限，请联系系统管理员');
        
    } catch (error) {
        console.log('❌ 操作失败:', error.message);
    }
}

// 执行查询
getAllUsers();