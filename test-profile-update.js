const axios = require('axios');

async function testProfileUpdate() {
    try {
        // 首先测试登录获取token
        console.log('=== 测试登录 ===');
        const loginResponse = await axios.post('http://localhost:9090/user/localLogin', {
            phone: '13800138000',
            password: '123456'
        });
        
        console.log('登录响应:', loginResponse.data);
        const token = loginResponse.data.data.token;
        console.log('获取到token:', token);
        
        // 测试获取用户信息
        console.log('\n=== 测试获取用户信息 ===');
        const profileResponse = await axios.post('http://localhost:9090/user/me', {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('用户信息响应:', profileResponse.data);
        
        // 测试更新用户资料
        console.log('\n=== 测试更新用户资料 ===');
        const updateResponse = await axios.post('http://localhost:9090/user/updateProfile', {
            nickname: '测试昵称' + Date.now(),
            gender: 1,
            birthDate: '1990-01-01'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('更新响应:', updateResponse.data);
        
    } catch (error) {
        console.error('测试失败:', error.response?.data || error.message);
    }
}

testProfileUpdate();