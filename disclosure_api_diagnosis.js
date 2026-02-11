const axios = require('axios');

async function diagnoseDisclosureIssue() {
    console.log('=== 投稿审查页面加载问题诊断 ===\n');
    
    try {
        // 1. 测试后端服务连通性
        console.log('1. 测试后端服务连通性...');
        try {
            const healthCheck = await axios.get('http://localhost:9090/actuator/health', {
                timeout: 3000
            });
            console.log('✅ 后端服务运行正常\n');
        } catch (error) {
            console.log('⚠️  后端健康检查端点不可用（可能是正常现象）\n');
        }
        
        // 2. 管理员登录测试
        console.log('2. 管理员登录测试...');
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
            
            // 3. 测试待审核投稿API
            console.log('3. 测试待审核投稿API...');
            try {
                const pendingResponse = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 10000
                });
                
                console.log('待审核投稿响应状态:', pendingResponse.status);
                const pendingData = pendingResponse.data?.data || [];
                console.log('待审核投稿数量:', pendingData.length);
                
                if (pendingData.length > 0) {
                    console.log('✅ 待审核投稿接口工作正常');
                    console.log('数据示例:');
                    console.log(JSON.stringify(pendingData[0], null, 2));
                } else {
                    console.log('⚠️  待审核投稿接口返回空数据');
                }
            } catch (pendingError) {
                console.log('❌ 待审核投稿接口错误:', pendingError.response?.data || pendingError.message);
            }
            
            // 4. 测试已公开投稿API
            console.log('\n4. 测试已公开投稿API...');
            try {
                const publicResponse = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 10000
                });
                
                console.log('已公开投稿响应状态:', publicResponse.status);
                const publicData = publicResponse.data?.data || [];
                console.log('已公开投稿数量:', publicData.length);
                
                if (publicData.length > 0) {
                    console.log('✅ 已公开投稿接口工作正常');
                    console.log('数据示例:');
                    console.log(JSON.stringify(publicData[0], null, 2));
                } else {
                    console.log('⚠️  已公开投稿接口返回空数据');
                }
            } catch (publicError) {
                console.log('❌ 已公开投稿接口错误:', publicError.response?.data || publicError.message);
            }
            
            // 5. 综合统计
            console.log('\n5. 投稿数据综合统计...');
            try {
                const [pendingRes, publicRes] = await Promise.all([
                    axios.post('http://localhost:9090/disclosure/queryPendingList', {
                        pageNum: 1,
                        pageSize: 1000
                    }, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    axios.post('http://localhost:9090/disclosure/queryPublicList', {
                        pageNum: 1,
                        pageSize: 1000
                    }, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                ]);
                
                const pendingCount = pendingRes.data?.data?.length || 0;
                const publicCount = publicRes.data?.data?.length || 0;
                const totalCount = pendingCount + publicCount;
                
                console.log('📊 投稿数据汇总:');
                console.log(`   待审核: ${pendingCount} 条`);
                console.log(`   已公开: ${publicCount} 条`);
                console.log(`   总计: ${totalCount} 条`);
                
                if (totalCount === 0) {
                    console.log('\n💡 诊断建议:');
                    console.log('   - 当前无投稿数据，请创建测试投稿');
                    console.log('   - 检查数据库中DISCLOSURE表是否存在');
                    console.log('   - 确认投稿提交功能是否正常工作');
                } else {
                    console.log('\n✅ 投稿数据正常，接口工作良好');
                }
                
            } catch (statsError) {
                console.log('❌ 获取统计数据失败:', statsError.message);
            }
            
        } else {
            console.log('❌ 管理员登录失败:', loginResponse.data?.msg);
        }
        
    } catch (error) {
        console.log('❌ 诊断过程中发生错误:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
        console.log('\n💡 故障排除建议:');
        console.log('   1. 确认后端服务是否在9090端口运行');
        console.log('   2. 检查数据库连接是否正常');
        console.log('   3. 确认管理员账户testuser3是否存在');
        console.log('   4. 检查网络连接和防火墙设置');
    }
}

// 执行诊断
diagnoseDisclosureIssue();