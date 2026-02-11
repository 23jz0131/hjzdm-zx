const axios = require('axios');

async function checkUserExists() {
    console.log('=== 检查用户是否存在 ===\n');
    
    // 先尝试注册一个测试用户
    const registerData = {
        username: 'testuser3',
        email: 'testuser3@example.com',
        password: '123456',
        confirmPassword: '123456'
    };
    
    try {
        console.log('尝试注册用户...');
        const registerResponse = await axios.post('http://localhost:9090/user/register', registerData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        console.log('注册响应:', registerResponse.status, registerResponse.data);
        
    } catch (registerError) {
        console.log('注册失败:', registerError.response?.data || registerError.message);
        
        // 如果注册失败（可能用户已存在），尝试直接登录
        console.log('\n尝试登录已存在的用户...');
        const loginData = {
            username: 'testuser3',
            password: '123456'
        };
        
        try {
            const loginResponse = await axios.post('http://localhost:9090/user/login', loginData, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });
            
            console.log('登录响应:', loginResponse.status, loginResponse.data);
            
        } catch (loginError) {
            console.log('登录也失败:', loginError.response?.data || loginError.message);
        }
    }
}

// 执行检查
checkUserExists();