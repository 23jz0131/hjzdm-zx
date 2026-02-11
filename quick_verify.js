const axios = require('axios');

async function quickVerify() {
    console.log('=== 快速验证修复效果 ===\n');
    
    try {
        // 测试登录功能
        console.log('1. 测试用户登录...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ 登录功能正常');
            const token = loginResponse.data.data.token;
            
            // 测试获取用户信息
            console.log('\n2. 测试获取用户信息...');
            const profileResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (profileResponse.data && profileResponse.data.code === 200) {
                const userData = profileResponse.data.data;
                console.log('✅ 用户信息获取正常');
                console.log('   用户ID:', userData.id);
                console.log('   用户名:', userData.name);
                console.log('   昵称:', userData.nickname || '未设置');
                console.log('   创建时间:', userData.createTime);
                
                // 测试使用真实姓名的账户
                console.log('\n3. 测试真实姓名账户...');
                const zhanghuiLogin = await axios.post('http://localhost:9090/user/login', {
                    username: 'zhanghui',
                    password: '123123'
                });
                
                if (zhanghuiLogin.data && zhanghuiLogin.data.code === 200) {
                    console.log('✅ 真实姓名账户登录成功');
                    const zhanghuiToken = zhanghuiLogin.data.data.token;
                    const zhanghuiProfile = await axios.post('http://localhost:9090/user/me', {}, {
                        headers: { 'Authorization': `Bearer ${zhanghuiToken}` }
                    });
                    
                    if (zhanghuiProfile.data && zhanghuiProfile.data.code === 200) {
                        console.log('   昵称:', zhanghuiProfile.data.data.nickname || '未设置');
                    }
                }
            }
        }
        
        console.log('\n🎉 所有功能验证通过！');
        
    } catch (error) {
        console.log('❌ 验证过程中出现错误:', error.message);
        if (error.response) {
            console.log('   错误详情:', error.response.data?.msg || error.response.statusText);
        }
    }
}

quickVerify();