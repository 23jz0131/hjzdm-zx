const axios = require('axios');

async function verifyCloudDatabase() {
    console.log('=== 云端数据库验证 (9090端口) ===\n');
    
    try {
        // 测试testuser3登录
        console.log('1. 测试testuser3账户登录...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            console.log('✅ testuser3登录成功!');
            const token = loginResponse.data.data.token;
            
            // 获取用户信息
            const userResponse = await axios.post('http://localhost:9090/user/me', {}, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('用户信息:', userResponse.data.data);
            
            // 检查投稿信息
            console.log('\n2. 检查投稿信息...');
            try {
                // 测试获取披露列表
                const disclosureResponse = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 10
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                console.log('披露信息状态:', disclosureResponse.status);
                if (disclosureResponse.data && disclosureResponse.data.data) {
                    console.log('披露数量:', disclosureResponse.data.data.length || 0);
                }
                
            } catch (disclosureError) {
                console.log('披露信息查询:', disclosureError.response?.data?.msg || '暂无数据');
            }
            
        } else {
            console.log('❌ 登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('验证失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('错误信息:', error.response.data);
        }
    }
}

verifyCloudDatabase();