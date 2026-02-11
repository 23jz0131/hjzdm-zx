const axios = require('axios');

async function quickSystemCheck() {
    console.log('=== 系统状态快速检查 ===\n');
    
    try {
        // 测试核心功能
        console.log('1. 测试用户登录...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录功能正常');
            const token = loginResponse.data.data.token;
            
            // 测试用户信息获取
            console.log('\n2. 测试用户信息接口...');
            const userInfoResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (userInfoResponse.data && userInfoResponse.data.code === 200) {
                const userData = userInfoResponse.data.data;
                console.log('✅ 用户信息接口正常');
                console.log('   用户名:', userData.name);
                console.log('   昵称:', userData.nickname || '未设置');
                console.log('   ID:', userData.id);
            }
            
            // 测试真实姓名账户
            console.log('\n3. 测试真实姓名账户...');
            const zhanghuiLogin = await axios.post('http://localhost:9090/user/login', {
                username: 'zhanghui',
                password: '123123'
            });
            
            if (zhanghuiLogin.data && zhanghuiLogin.data.code === 200) {
                console.log('✅ 真实姓名账户登录成功');
                const zhanghuiToken = zhanghuiLogin.data.data.token;
                const zhanghuiInfo = await axios.post('http://localhost:9090/user/me', {}, {
                    headers: { 'Authorization': `Bearer ${zhanghuiToken}` }
                });
                
                if (zhanghuiInfo.data && zhanghuiInfo.data.code === 200) {
                    console.log('   昵称:', zhanghuiInfo.data.data.nickname || '未设置');
                }
            }
            
        } else {
            console.log('❌ 登录功能异常:', loginResponse.data?.msg);
        }
        
        console.log('\n🎉 系统检查完成！');
        console.log('请访问 http://localhost:3000 进行界面测试');
        
    } catch (error) {
        console.log('❌ 系统检查失败:', error.message);
        if (error.response) {
            console.log('   错误详情:', error.response.data?.msg || error.response.statusText);
        }
    }
}

quickSystemCheck();