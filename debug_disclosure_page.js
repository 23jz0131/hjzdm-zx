const axios = require('axios');

async function debugDisclosurePage() {
    console.log('=== 投稿审查页面问题诊断 ===\n');
    
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
            console.log('✅ 管理员登录成功');
            console.log('用户ID:', loginResponse.data.data.id);
            console.log('用户名:', loginResponse.data.data.name);
            console.log('');
            
            // 2. 检查数据库中是否有投稿数据
            console.log('2. 检查数据库投稿数据...');
            try {
                // 直接查询所有投稿
                const allDisclosures = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('数据库中公开投稿数量:', Array.isArray(allDisclosures.data.data) ? allDisclosures.data.data.length : 0);
                
                if (allDisclosures.data.data && allDisclosures.data.data.length > 0) {
                    console.log('公开投稿示例:');
                    allDisclosures.data.data.slice(0, 2).forEach((item, index) => {
                        console.log(`  ${index + 1}. ID:${item.disclosureId} 标题:"${item.title}" 状态:${item.status} 作者:${item.author}`);
                    });
                }
            } catch (dbError) {
                console.log('数据库查询失败:', dbError.response?.data || dbError.message);
            }
            
            // 3. 测试待审核投稿接口
            console.log('\n3. 测试待审核投稿接口...');
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
                
                console.log('待审核投稿接口响应状态:', pendingResponse.status);
                console.log('待审核投稿数量:', Array.isArray(pendingResponse.data.data) ? pendingResponse.data.data.length : 0);
                
                if (pendingResponse.data.data && pendingResponse.data.data.length > 0) {
                    console.log('待审核投稿示例:');
                    pendingResponse.data.data.slice(0, 2).forEach((item, index) => {
                        console.log(`  ${index + 1}. ID:${item.disclosureId} 标题:"${item.title}" 状态:${item.status}`);
                    });
                } else {
                    console.log('⚠️  没有待审核的投稿');
                }
                
            } catch (pendingError) {
                console.log('待审核投稿接口错误:', pendingError.response?.data || pendingError.message);
                if (pendingError.response?.data) {
                    console.log('错误详情:', JSON.stringify(pendingError.response.data, null, 2));
                }
            }
            
            // 4. 测试公开投稿接口
            console.log('\n4. 测试公开投稿接口...');
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
                
                console.log('公开投稿接口响应状态:', publicResponse.status);
                console.log('公开投稿数量:', Array.isArray(publicResponse.data.data) ? publicResponse.data.data.length : 0);
                
                if (publicResponse.data.data && publicResponse.data.data.length > 0) {
                    console.log('公开投稿示例:');
                    publicResponse.data.data.slice(0, 2).forEach((item, index) => {
                        console.log(`  ${index + 1}. ID:${item.disclosureId} 标题:"${item.title}" 状态:${item.status}`);
                    });
                } else {
                    console.log('⚠️  没有公开的投稿');
                }
                
            } catch (publicError) {
                console.log('公开投稿接口错误:', publicError.response?.data || publicError.message);
            }
            
            // 5. 检查权限验证
            console.log('\n5. 权限验证检查...');
            const isAdminPayload = {
                userId: loginResponse.data.data.id,
                username: loginResponse.data.data.name,
                roles: ['admin']
            };
            console.log('当前用户权限信息:', JSON.stringify(isAdminPayload, null, 2));
            
            // 6. 创建测试投稿（如果没有数据）
            console.log('\n6. 检查是否需要创建测试投稿...');
            try {
                const pendingCheck = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 1
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!pendingCheck.data.data || pendingCheck.data.data.length === 0) {
                    console.log('没有待审核投稿，创建测试投稿...');
                    
                    const testDisclosure = {
                        title: '测试投稿标题_' + Date.now(),
                        content: '这是一个用于测试的投稿内容，用来验证投稿审查页面的功能。',
                        link: 'https://example.com/test',
                        disclosurePrice: 999,
                        imgUrl: 'https://example.com/test-image.jpg'
                    };
                    
                    const addResponse = await axios.post('http://localhost:9090/disclosure/add', testDisclosure, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    console.log('创建测试投稿结果:', addResponse.data?.msg || '成功');
                    
                    // 再次检查待审核投稿
                    setTimeout(async () => {
                        const recheckResponse = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                            pageNum: 1,
                            pageSize: 10
                        }, {
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        console.log('创建后待审核投稿数量:', Array.isArray(recheckResponse.data.data) ? recheckResponse.data.data.length : 0);
                    }, 1000);
                } else {
                    console.log('已有待审核投稿，无需创建测试数据');
                }
                
            } catch (createError) {
                console.log('创建测试投稿失败:', createError.response?.data || createError.message);
            }
            
        } else {
            console.log('❌ 管理员登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 诊断过程出错:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// 执行诊断
debugDisclosurePage();