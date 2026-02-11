const axios = require('axios');

async function verifyPhoneRemoval() {
    console.log('=== 验证PHONE字段移除 ===\n');
    
    try {
        // 测试登录功能
        console.log('1. 测试用户登录...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录功能正常');
            
            // 获取用户信息验证字段
            const token = loginResponse.data.data.token;
            const userInfoResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (userInfoResponse.data && userInfoResponse.data.code === 200) {
                const userData = userInfoResponse.data.data;
                console.log('✅ 用户信息获取正常');
                console.log('   用户ID:', userData.id);
                console.log('   用户名:', userData.name);
                console.log('   昵称:', userData.nickname || '未设置');
                console.log('   手机字段:', userData.phone !== undefined ? '仍存在' : '已移除');
                
                // 验证真实姓名账户
                console.log('\n2. 测试真实姓名账户...');
                const zhanghuiLogin = await axios.post('http://localhost:9090/user/login', {
                    username: 'zhanghui',
                    password: '123123'
                });
                
                if (zhanghuiLogin.data && zhanghuiLogin.data.code === 200) {
                    console.log('✅ 真实姓名账户正常');
                }
            }
        }
        
        console.log('\n🎉 PHONE字段移除验证完成！');
        
    } catch (error) {
        console.log('❌ 验证失败:', error.message);
        if (error.response) {
            console.log('   错误详情:', error.response.data?.msg || error.response.statusText);
        }
    }
}

verifyPhoneRemoval();