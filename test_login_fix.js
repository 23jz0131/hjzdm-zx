const axios = require('axios');

async function testUserLogin() {
    console.log('=== 测试用户登录功能 ===\n');
    
    try {
        const response = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        console.log('登录响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.code === 200) {
            console.log('✅ 登录成功！');
            console.log('用户ID:', response.data.data?.id);
            console.log('Token长度:', response.data.data?.token?.length || 0);
        } else {
            console.log('❌ 登录失败:', response.data?.msg || '未知错误');
        }
        
    } catch (error) {
        console.log('❌ 请求失败:', error.message);
        if (error.response) {
            console.log('错误响应:', error.response.status, error.response.data);
        }
    }
}

testUserLogin();