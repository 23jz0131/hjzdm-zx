const axios = require('axios');

async function diagnoseDisclosureIssue() {
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
            
            // 2. 检查数据库中的投稿数据
            console.log('2. 检查数据库投稿数据...');
            try {
                // 直接查询所有投稿
                const allDisclosures = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 1000
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('数据库中总投稿数量:', Array.isArray(allDisclosures.data.data) ? allDisclosures.data.data.length : 0);
                
                if (allDisclosures.data.data && allDisclosures.data.data.length > 0) {
                    const stats = {
                        total: allDisclosures.data.data.length,
                        pending: allDisclosures.data.data.filter(d => d.status === 0).length,
                        public: allDisclosures.data.data.filter(d => d.status === 1).length,
                        rejected: allDisclosures.data.data.filter(d => d.status === 2).length
                    };
                    
                    console.log('📊 投稿状态统计:');
                    console.log(`   总计: ${stats.total} 条`);
                    console.log(`   待审核: ${stats.pending} 条`);
                    console.log(`   已公开: ${stats.public} 条`);
                    console.log(`   被拒绝: ${stats.rejected} 条\n`);
                    
                    console.log('📋 投稿详情示例:');
                    allDisclosures.data.data.slice(0, 3).forEach((item, index) => {
                        const statusMap = {0: '待审核', 1: '已公开', 2: '被拒绝'};
                        console.log(`${index + 1}. [${statusMap[item.status]}] ${item.title}`);
                        console.log(`   ID: ${item.disclosureId}`);
                        console.log(`   作者: ${item.author}`);
                        console.log(`   价格: ¥${item.disclosurePrice}`);
                        console.log(`   时间: ${item.createTime}\n`);
                    });
                } else {
                    console.log('⚠️  数据库中暂无投稿数据\n');
                }
            } catch (dbError) {
                console.log('❌ 数据库查询失败:', dbError.response?.data || dbError.message);
            }
            
            // 3. 测试待审核投稿接口
            console.log('3. 测试待审核投稿接口...');
            try {
                const pendingResponse = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 100
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
                    console.log('✅ 待审核投稿接口工作正常');
                    console.log('数据结构示例:');
                    console.log(JSON.stringify(pendingResponse.data.data[0], null, 2));
                } else {
                    console.log('⚠️  待审核投稿接口返回空数据');
                }
            } catch (pendingError) {
                console.log('❌ 待审核投稿接口错误:', pendingError.response?.data || pendingError.message);
            }
            
            // 4. 测试已公开投稿接口
            console.log('\n4. 测试已公开投稿接口...');
            try {
                const publicResponse = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 5000
                });
                
                console.log('已公开投稿接口响应状态:', publicResponse.status);
                console.log('已公开投稿数量:', Array.isArray(publicResponse.data.data) ? publicResponse.data.data.length : 0);
                
                if (publicResponse.data.data && publicResponse.data.data.length > 0) {
                    console.log('✅ 已公开投稿接口工作正常');
                } else {
                    console.log('⚠️  已公开投稿接口返回空数据');
                }
            } catch (publicError) {
                console.log('❌ 已公开投稿接口错误:', publicError.response?.data || publicError.message);
            }
            
            // 5. 测试前端可能的数据处理问题
            console.log('\n5. 模拟前端数据处理...');
            try {
                // 获取所有数据来模拟前端的"全部"标签
                const pendingRes = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const publicRes = await axios.post('http://localhost:9090/disclosure/queryPublicList', {
                    pageNum: 1,
                    pageSize: 100
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const allData = [
                    ...(pendingRes.data?.data || []),
                    ...(publicRes.data?.data || [])
                ];
                
                console.log('前端"全部"标签模拟结果:');
                console.log(`   合并后总数: ${allData.length}`);
                console.log(`   待审核: ${allData.filter(d => d.status === 0).length}`);
                console.log(`   已公开: ${allData.filter(d => d.status === 1).length}`);
                
            } catch (mergeError) {
                console.log('❌ 数据合并测试失败:', mergeError.message);
            }
            
            // 6. 测试审核功能
            console.log('\n6. 测试审核功能...');
            try {
                // 查找一个待审核的投稿进行测试
                const pendingList = await axios.post('http://localhost:9090/disclosure/queryPendingList', {
                    pageNum: 1,
                    pageSize: 1
                }, {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (pendingList.data?.data?.length > 0) {
                    const testDisclosure = pendingList.data.data[0];
                    console.log(`测试审核投稿 ID: ${testDisclosure.disclosureId}, 标题: "${testDisclosure.title}"`);
                    
                    // 尝试通过审核
                    const auditResponse = await axios.post('http://localhost:9090/disclosure/audit', {
                        disclosureId: testDisclosure.disclosureId,
                        status: 1
                    }, {
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    console.log('审核接口响应:', auditResponse.data);
                    
                    if (auditResponse.data && auditResponse.data.code === 200) {
                        console.log('✅ 审核功能正常');
                        
                        // 恢复原状态
                        await axios.post('http://localhost:9090/disclosure/audit', {
                            disclosureId: testDisclosure.disclosureId,
                            status: 0
                        }, {
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        console.log('🔄 已恢复原始状态');
                    }
                } else {
                    console.log('⚠️  没有待审核的投稿用于测试');
                }
            } catch (auditError) {
                console.log('❌ 审核功能测试失败:', auditError.response?.data || auditError.message);
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
    }
    
    console.log('\n=== 诊断完成 ===');
    console.log('\n常见问题解决方案:');
    console.log('1. 如果数据库中没有投稿数据，请先创建测试投稿');
    console.log('2. 检查管理员权限是否正确配置');
    console.log('3. 确认前端页面的JavaScript没有报错');
    console.log('4. 验证API接口返回的数据格式是否符合前端预期');
}

// 执行诊断
diagnoseDisclosureIssue();