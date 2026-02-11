const axios = require('axios');

async function testDisclosureAPI() {
    console.log('=== 投稿API测试 ===\n');
    
    try {
        // 1. 管理员登录
        console.log('1. 测试管理员登录...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            const token = loginResponse.data.data.token;
            console.log('✅ 登录成功\n');
            
            // 2. 测试待审核投稿API
            console.log('2. 测试待审核投稿API...');
            try {
                const pendingResponse = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('待审核投稿响应状态:', pendingResponse.status);
                console.log('待审核投稿数量:', pendingResponse.data?.data?.length || 0);
                
                if (pendingResponse.data.data && pendingResponse.data.data.length > 0) {
                    console.log('✅ 待审核投稿接口工作正常');
                    console.log('数据示例:');
                    console.log(JSON.stringify(pendingResponse.data.data[0], null, 2));
                } else {
                    console.log('⚠️  待审核投稿接口返回空数据');
                }
            } catch (pendingError) {
                console.log('❌ 待审核投稿接口错误:', pendingError.response?.data || pendingError.message);
            }
            
            // 3. 测试已公开投稿API
            console.log('\n3. 测试已公开投稿API...');
            try {
                const publicResponse = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('已公开投稿响应状态:', publicResponse.status);
                console.log('已公开投稿数量:', publicResponse.data?.data?.length || 0);
                
                if (publicResponse.data.data && publicResponse.data.data.length > 0) {
                    console.log('✅ 已公开投稿接口工作正常');
                    console.log('数据示例:');
                    console.log(JSON.stringify(publicResponse.data.data[0], null, 2));
                } else {
                    console.log('⚠️  已公开投稿接口返回空数据');
                }
            } catch (publicError) {
                console.log('❌ 已公开投稿接口错误:', publicError.response?.data || publicError.message);
            }
            
        } else {
            console.log('❌ 管理员登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 测试过程中发生错误:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// 执行测试
testDisclosureAPI();