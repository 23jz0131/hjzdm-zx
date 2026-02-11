const axios = require('axios');

async function testService() {
    console.log('=== 服务状态测试 ===\n');
    
    try {
        // 测试基本连接
        console.log('1. 测试服务连接...');
        const response = await axios.get('http://localhost:9090/actuator/health', {
            timeout: 3000
        });
        console.log('✅ 服务连接正常');
        console.log('   状态:', response.data.status);
        
    } catch (error) {
        console.log('❌ 服务连接失败');
        if (error.code === 'ECONNREFUSED') {
            console.log('   原因: 服务未启动或端口未监听');
        } else {
            console.log('   错误:', error.message);
        }
    }
    
    try {
        // 测试登录API
        console.log('\n2. 测试登录API...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        }, {
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录API正常');
            console.log('   Token获取:', loginResponse.data.data?.token ? '成功' : '失败');
        } else {
            console.log('❌ 登录API异常');
            console.log('   响应码:', loginResponse.data?.code);
            console.log('   错误信息:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 登录测试失败');
        if (error.response) {
            console.log('   服务器响应:', error.response.data?.msg || error.response.statusText);
        } else {
            console.log('   错误:', error.message);
        }
    }
    
    console.log('\n=== 测试完成 ===');
}

testService();