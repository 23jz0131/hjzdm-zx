const axios = require('axios');

async function testDatabaseFix() {
    console.log('=== 数据库字段修复验证 ===\n');
    
    try {
        // 测试登录功能
        console.log('1. 测试用户登录...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录功能正常');
            const token = loginResponse.data.data.token;
            
            // 测试获取用户信息
            console.log('\n2. 测试用户信息接口...');
            const userInfoResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                timeout: 5000
            });
            
            if (userInfoResponse.data && userInfoResponse.data.code === 200) {
                const userData = userInfoResponse.data.data;
                console.log('✅ 用户信息获取正常');
                console.log('   用户ID:', userData.id);
                console.log('   用户名:', userData.name);
                console.log('   昵称:', userData.nickname || '未设置');
                console.log('   openid字段:', userData.openid !== undefined ? '存在' : '不存在');
            }
        } else {
            console.log('❌ 登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 测试失败:', error.message);
        if (error.response) {
            console.log('   错误详情:', error.response.data?.msg || error.response.statusText);
        }
    }
    
    console.log('\n=== 验证完成 ===');
}

testDatabaseFix();