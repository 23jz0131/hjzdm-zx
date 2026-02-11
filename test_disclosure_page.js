const axios = require('axios');

async function testDisclosurePage() {
    console.log('=== 投稿审查页面数据获取测试 ===\n');
    
    try {
        // 1. 使用管理员账户登录
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
            console.log('✅ 管理员登录成功');
            console.log('Token:', token.substring(0, 20) + '...\n');
            
            // 2. 测试获取待审核投稿
            console.log('2. 获取待审核投稿测试...');
            try {
                const pendingResponse = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 20
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('待审核投稿响应状态:', pendingResponse.status);
                console.log('待审核投稿数据结构:', JSON.stringify(pendingResponse.data, null, 2));
                
                if (pendingResponse.data && pendingResponse.data.data) {
                    console.log(`\n找到 ${Array.isArray(pendingResponse.data.data) ? pendingResponse.data.data.length : 0} 个待审核投稿`);
                    if (Array.isArray(pendingResponse.data.data) && pendingResponse.data.data.length > 0) {
                        console.log('\n待审核投稿详情:');
                        pendingResponse.data.data.forEach((disclosure, index) => {
                            console.log(`${index + 1}. ID: ${disclosure.disclosureId}`);
                            console.log(`   标题: ${disclosure.title}`);
                            console.log(`   状态: ${disclosure.status}`);
                            console.log(`   作者: ${disclosure.author}`);
                            console.log(`   创建时间: ${disclosure.createTime}`);
                            console.log('   ---');
                        });
                    }
                }
            } catch (pendingError) {
                console.log('❌ 获取待审核投稿失败:', pendingError.response?.data || pendingError.message);
            }
            
            // 3. 测试获取公开投稿
            console.log('\n3. 获取公开投稿测试...');
            try {
                const publicResponse = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 20
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('公开投稿响应状态:', publicResponse.status);
                console.log('公开投稿数据结构:', JSON.stringify(publicResponse.data, null, 2));
                
                if (publicResponse.data && publicResponse.data.data) {
                    console.log(`\n找到 ${Array.isArray(publicResponse.data.data) ? publicResponse.data.data.length : 0} 个公开投稿`);
                }
            } catch (publicError) {
                console.log('❌ 获取公开投稿失败:', publicError.response?.data || publicError.message);
            }
            
            // 4. 测试投稿审核功能
            console.log('\n4. 投稿审核功能测试...');
            try {
                // 先获取一个待审核的投稿ID
                const pendingListResponse = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 1
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (pendingListResponse.data && pendingListResponse.data.data && pendingListResponse.data.data.length > 0) {
                    const disclosureId = pendingListResponse.data.data[0].disclosureId;
                    console.log(`测试审核投稿ID: ${disclosureId}`);
                    
                    // 测试通过审核
                    const auditResponse = await axios.post('http://localhost:9090/disclosure/audit', {
                        disclosureId: disclosureId,
                        status: 1  // 1表示通过
                    }, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        timeout: 5000
                    });
                    
                    console.log('审核响应:', JSON.stringify(auditResponse.data, null, 2));
                    
                } else {
                    console.log('没有待审核的投稿可供测试');
                }
                
            } catch (auditError) {
                console.log('❌ 投稿审核测试失败:', auditError.response?.data || auditError.message);
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
testDisclosurePage();