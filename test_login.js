const axios = require('axios');

async function testLogin() {
    console.log('=== 测试登录功能 ===\n');
    
    const loginData = {
        username: 'testuser3',
        password: '123456'
    };
    
    try {
        console.log('发送登录请求到: http://localhost:9090/user/login');
        console.log('请求数据:', loginData);
        
        const response = await axios.post('http://localhost:9090/user/login', loginData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('\n✅ 登录请求成功!');
        console.log('响应状态码:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.code === 200) {
            console.log('\n🎉 登录成功!');
            const token = response.data.data?.token || response.data.token;
            if (token) {
                console.log('JWT Token:', token.substring(0, 50) + '...');
            }
        } else {
            console.log('\n❌ 登录失败:', response.data?.message || '未知错误');
        }
        
    } catch (error) {
        console.log('\n❌ 登录请求失败:');
        if (error.response) {
            console.log('状态码:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('网络错误: 无法连接到服务器');
            console.log('请检查后端服务是否在运行 (端口9090)');
        } else {
            console.log('错误信息:', error.message);
        }
    }
}

// 执行测试
testLogin();