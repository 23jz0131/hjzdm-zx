const axios = require('axios');

async function testServiceStatus() {
    console.log('=== 服务状态检测 ===\n');
    
    try {
        // 测试9090端口是否响应
        console.log('1. 检测9090端口服务状态...');
        const response = await axios.get('http://localhost:9090/actuator/health', {
            timeout: 3000
        });
        console.log('✅ 9090端口服务正常运行');
        console.log('   健康状态:', response.data.status);
        
    } catch (error) {
        console.log('❌ 9090端口服务未响应');
        if (error.code === 'ECONNREFUSED') {
            console.log('   原因: 服务未启动或端口被占用');
        } else {
            console.log('   错误:', error.message);
        }
    }
    
    try {
        // 测试登录API
        console.log('\n2. 测试用户登录API...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        }, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录API正常工作');
            console.log('   Token获取成功');
            
            // 测试获取用户信息
            const token = loginResponse.data.data?.token;
            if (token) {
                const profileResponse = await axios.post('http://localhost:9090/user/me', {}, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });
                
                if (profileResponse.data && profileResponse.data.code === 200) {
                    console.log('✅ 用户信息获取成功');
                    const userData = profileResponse.data.data;
                    console.log('   用户ID:', userData.id);
                    console.log('   用户名:', userData.name);
                    console.log('   昵称:', userData.nickname || '未设置');
                    
                    // 检查是否还存在gender字段
                    if (userData.hasOwnProperty('gender')) {
                        console.log('⚠️  仍然存在gender字段');
                    } else {
                        console.log('✅ gender字段已正确移除');
                    }
                }
            }
        } else {
            console.log('❌ 登录API异常');
            console.log('   响应码:', loginResponse.data?.code);
            console.log('   错误信息:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ API测试失败');
        if (error.response) {
            console.log('   服务器错误:', error.response.data?.msg || error.response.statusText);
        } else {
            console.log('   网络错误:', error.message);
        }
    }
    
    console.log('\n=== 检测完成 ===');
}

// 执行测试
testServiceStatus();