const axios = require('axios');

async function testAdminDisclosureInterface() {
    console.log('=== 管理者界面投稿加载测试 ===\n');
    
    try {
        // 1. 管理员登录
        console.log('1. 管理员登录测试...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'testuser3',
            password: '123123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        
        if (loginResponse.data && loginResponse.data.code === 200) {
            const token = loginResponse.data.data.token;
            console.log('✅ 管理员登录成功\n');
            
            // 2. 测试全部投稿接口
            console.log('2. 全部投稿接口测试...');
            try {
                // 获取待审核投稿
                const pendingRes = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                // 获取公开投稿
                const publicRes = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('待审核投稿响应:', pendingRes.status, '| 数据量:', Array.isArray(pendingRes.data.data) ? pendingRes.data.data.length : 0);
                console.log('公开投稿响应:', publicRes.status, '| 数据量:', Array.isArray(publicRes.data.data) ? publicRes.data.data.length : 0);
                
                // 合并数据模拟"全部投稿"
                const allDisclosures = [
                    ...(pendingRes.data.data || []),
                    ...(publicRes.data.data || [])
                ];
                
                console.log('全部投稿总数:', allDisclosures.length);
                console.log('数据结构示例:', JSON.stringify(allDisclosures[0] || '无数据', null, 2));
                
            } catch (allError) {
                console.log('❌ 全部投稿接口测试失败:', allError.response?.data || allError.message);
            }
            
            // 3. 测试未承认投稿接口
            console.log('\n3. 未承认投稿接口测试...');
            try {
                const pendingResponse = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 200
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('未承认投稿响应状态:', pendingResponse.status);
                console.log('未承认投稿数据量:', Array.isArray(pendingResponse.data.data) ? pendingResponse.data.data.length : 0);
                if (pendingResponse.data.data && pendingResponse.data.data.length > 0) {
                    console.log('第一条未承认投稿状态:', pendingResponse.data.data[0].status);
                }
                
            } catch (pendingError) {
                console.log('❌ 未承认投稿接口测试失败:', pendingError.response?.data || pendingError.message);
            }
            
            // 4. 测试已承认投稿接口
            console.log('\n4. 已承认投稿接口测试...');
            try {
                const publicResponse = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 200
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('已承认投稿响应状态:', publicResponse.status);
                console.log('已承认投稿数据量:', Array.isArray(publicResponse.data.data) ? publicResponse.data.data.length : 0);
                if (publicResponse.data.data && publicResponse.data.data.length > 0) {
                    console.log('第一条已承认投稿状态:', publicResponse.data.data[0].status);
                }
                
            } catch (publicError) {
                console.log('❌ 已承认投稿接口测试失败:', publicError.response?.data || publicError.message);
            }
            
            // 5. 测试前端可能使用的其他接口
            console.log('\n5. 其他相关接口测试...');
            
            // 测试用户信息接口
            try {
                const userResponse = await axios.post('http://localhost:9090/user/me', {}, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('用户信息接口:', userResponse.status, '| 用户ID:', userResponse.data.data?.id);
            } catch (userError) {
                console.log('用户信息接口失败:', userError.response?.data || userError.message);
            }
            
        } else {
            console.log('❌ 管理员登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 测试失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// 执行测试
testAdminDisclosureInterface();