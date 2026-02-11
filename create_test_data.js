const axios = require('axios');

async function createTestData() {
    console.log('=== 创建测试投稿数据 ===\n');
    
    try {
        // 1. 管理员登录
        console.log('1. 管理员登录...');
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
            
            // 2. 创建几个测试投稿（包括待审核状态）
            console.log('2. 创建测试投稿...');
            
            const testDisclosures = [
                {
                    title: '测试投稿1 - 待审核',
                    content: '这是一个待审核的测试投稿内容',
                    link: 'https://example.com/test1',
                    disclosurePrice: 9999,
                    status: 0  // 待审核
                },
                {
                    title: '测试投稿2 - 待审核',
                    content: '另一个待审核的测试投稿内容',
                    link: 'https://example.com/test2',
                    disclosurePrice: 19999,
                    status: 0  // 待审核
                }
            ];
            
            // 注意：这里需要通过正常的投稿接口创建，因为直接插入数据库可能绕过业务逻辑
            // 让我们检查是否有直接创建投稿的管理员接口
            
            console.log('3. 检查当前投稿状态...');
            const pendingRes = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                pageNum: 1,
                pageSize: 10
            }, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const publicRes = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                pageNum: 1,
                pageSize: 10
            }, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('当前待审核投稿数量:', pendingRes.data.data?.length || 0);
            console.log('当前已公开投稿数量:', publicRes.data.data?.length || 0);
            
            // 4. 如果有待审核投稿，测试审核功能
            if (pendingRes.data.data && pendingRes.data.data.length > 0) {
                console.log('\n4. 测试审核功能...');
                const firstPending = pendingRes.data.data[0];
                console.log('审核投稿ID:', firstPending.disclosureId);
                
                try {
                    const auditResponse = await axios.post('http://localhost:9090/disclosure/audit', {
                        disclosureId: firstPending.disclosureId,
                        status: 1  // 通过审核
                    }, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    console.log('审核结果:', auditResponse.data);
                    
                    // 重新检查状态
                    const updatedPendingRes = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                        pageNum: 1,
                        pageSize: 10
                    }, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    const updatedPublicRes = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                        pageNum: 1,
                        pageSize: 10
                    }, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    console.log('审核后待审核投稿数量:', updatedPendingRes.data.data?.length || 0);
                    console.log('审核后已公开投稿数量:', updatedPublicRes.data.data?.length || 0);
                    
                } catch (auditError) {
                    console.log('审核失败:', auditError.response?.data || auditError.message);
                }
            } else {
                console.log('\n4. 暂无待审核投稿可供测试');
            }
            
        } else {
            console.log('❌ 管理员登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 操作失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// 执行测试数据创建
createTestData();