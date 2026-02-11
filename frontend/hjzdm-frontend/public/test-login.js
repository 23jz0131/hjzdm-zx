// 前端登录测试脚本
// 在浏览器控制台中运行此脚本测试登录功能

console.log('=== 前端登录测试 ===');

// 模拟前端登录请求
async function testFrontendLogin() {
    const loginData = {
        username: 'testuser3',
        password: '123456'
    };
    
    try {
        console.log('发送登录请求...');
        const response = await fetch('/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        console.log('响应状态:', response.status);
        console.log('响应数据:', data);
        
        if (data.code === 200) {
            console.log('✅ 登录成功!');
            const token = data.data?.token;
            if (token) {
                localStorage.setItem('token', token);
                console.log('Token已保存到localStorage');
            }
        } else {
            console.log('❌ 登录失败:', data.msg || data.message);
        }
        
    } catch (error) {
        console.error('请求失败:', error);
    }
}

// 测试获取用户信息
async function testGetUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('请先登录获取token');
        return;
    }
    
    try {
        console.log('获取用户信息...');
        const response = await fetch('/user/me', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('用户信息响应:', data);
        
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }
}

// 在浏览器中运行测试
window.testLogin = testFrontendLogin;
window.testGetUserInfo = testGetUserInfo;

console.log('可用的测试函数:');
console.log('- testLogin(): 测试登录功能');
console.log('- testGetUserInfo(): 测试获取用户信息');

// 自动运行登录测试
testFrontendLogin();