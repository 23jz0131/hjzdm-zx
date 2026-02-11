const http = require('http');

console.log('🔍 检查登录功能...\n');

function testLogin() {
    // 测试用户登录
    const loginData = JSON.stringify({
        username: 'zhanghui',
        password: '123456'
    });

    const loginOptions = {
        hostname: 'localhost',
        port: 9090,
        path: '/user/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };

    console.log('🚀 测试用户登录...');
    console.log('用户名: zhanghui');
    console.log('密码: 123456');
    
    const loginReq = http.request(loginOptions, (res) => {
        console.log(`\n📡 登录响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📦 登录响应:', JSON.stringify(jsonData, null, 2));
                
                if (res.statusCode === 200 && jsonData.code === 200) {
                    console.log('✅ 登录成功！');
                    console.log('用户信息:', jsonData.data.user);
                    console.log('Token:', jsonData.data.token ? '已获取' : '未获取');
                    
                    // 如果登录成功，测试获取用户信息
                    if (jsonData.data.token) {
                        testGetUserInfo(jsonData.data.token);
                    }
                } else {
                    console.log('❌ 登录失败');
                    console.log('错误信息:', jsonData.message || '未知错误');
                }
                
            } catch (error) {
                console.error('❌ 解析登录响应失败:', error.message);
                console.log('原始响应:', data);
            }
        });
    });

    loginReq.on('error', (error) => {
        console.error('❌ 登录请求失败:', error.message);
    });

    loginReq.write(loginData);
    loginReq.end();
}

function testGetUserInfo(token) {
    console.log('\n🔍 测试获取用户信息...');
    
    const userInfoOptions = {
        hostname: 'localhost',
        port: 9090,
        path: '/user/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const userInfoReq = http.request(userInfoOptions, (res) => {
        console.log(`📡 用户信息响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📦 用户信息响应:', JSON.stringify(jsonData, null, 2));
                
                if (res.statusCode === 200 && jsonData.code === 200) {
                    console.log('✅ 获取用户信息成功！');
                    console.log('用户详情:', jsonData.data);
                } else {
                    console.log('❌ 获取用户信息失败');
                    console.log('错误信息:', jsonData.message || '未知错误');
                }
                
            } catch (error) {
                console.error('❌ 解析用户信息响应失败:', error.message);
                console.log('原始响应:', data);
            }
        });
    });

    userInfoReq.on('error', (error) => {
        console.error('❌ 获取用户信息请求失败:', error.message);
    });

    userInfoReq.end();
}

// 测试不存在的用户登录
function testInvalidLogin() {
    console.log('\n🔍 测试无效用户登录...');
    
    const invalidLoginData = JSON.stringify({
        username: 'nonexistent',
        password: 'wrongpassword'
    });

    const invalidLoginOptions = {
        hostname: 'localhost',
        port: 9090,
        path: '/user/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(invalidLoginData)
        }
    };

    const invalidLoginReq = http.request(invalidLoginOptions, (res) => {
        console.log(`📡 无效登录响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📦 无效登录响应:', JSON.stringify(jsonData, null, 2));
                
                if (res.statusCode === 401 || jsonData.code !== 200) {
                    console.log('✅ 无效用户登录被正确拒绝');
                } else {
                    console.log('⚠️  无效用户登录未被拒绝');
                }
                
            } catch (error) {
                console.error('❌ 解析无效登录响应失败:', error.message);
            }
        });
    });

    invalidLoginReq.on('error', (error) => {
        console.error('❌ 无效登录请求失败:', error.message);
    });

    invalidLoginReq.write(invalidLoginData);
    invalidLoginReq.end();
}

// 执行所有测试
testLogin();
setTimeout(testInvalidLogin, 2000);