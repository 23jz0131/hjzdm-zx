const axios = require('axios');

async function runDisclosureCheck() {
    console.log('=== 🚀 投稿审查页面数据检查 ===\n');
    
    try {
        // 1. 检查后端服务状态
        console.log('1️⃣ 检查后端服务连接...');
        try {
            const healthResponse = await axios.get('http://localhost:9090/actuator/health', {
                timeout: 3000
            });
            console.log('✅ 后端服务运行正常\n');
        } catch (healthError) {
            console.log('❌ 后端服务不可用');
            console.log('   请确保Spring Boot应用已在9090端口运行\n');
            return;
        }
        
        // 2. 管理员登录
        console.log('2️⃣ 管理员登录测试...');
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
            console.log(`   用户ID: ${loginResponse.data.data.id}`);
            console.log(`   用户名: ${loginResponse.data.data.name}\n`);
            
            // 3. 检查待审核投稿
            console.log('3️⃣ 检查待审核投稿...');
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
                
                if (pendingResponse.data && pendingResponse.data.code === 200) {
                    const pendingCount = pendingResponse.data.data?.length || 0;
                    console.log(`✅ 待审核投稿接口正常`);
                    console.log(`   数据量: ${pendingCount} 条`);
                    
                    if (pendingCount > 0) {
                        console.log('   数据示例:');
                        pendingResponse.data.data.slice(0, 2).forEach((item, index) => {
                            console.log(`     ${index + 1}. "${item.title}" (ID: ${item.disclosureId}, 状态: ${item.status})`);
                        });
                    } else {
                        console.log('   ⚠️  暂无待审核投稿');
                    }
                } else {
                    console.log('❌ 待审核投稿接口异常');
                    console.log(`   错误信息: ${pendingResponse.data?.msg || '未知错误'}`);
                }
            } catch (pendingError) {
                console.log('❌ 待审核投稿接口调用失败');
                console.log(`   错误: ${pendingError.message}`);
            }
            
            // 4. 检查已公开投稿
            console.log('\n4️⃣ 检查已公开投稿...');
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
                
                if (publicResponse.data && publicResponse.data.code === 200) {
                    const publicCount = publicResponse.data.data?.length || 0;
                    console.log(`✅ 已公开投稿接口正常`);
                    console.log(`   数据量: ${publicCount} 条`);
                    
                    if (publicCount > 0) {
                        console.log('   数据示例:');
                        publicResponse.data.data.slice(0, 2).forEach((item, index) => {
                            console.log(`     ${index + 1}. "${item.title}" (ID: ${item.disclosureId}, 状态: ${item.status})`);
                        });
                    } else {
                        console.log('   ⚠️  暂无已公开投稿');
                    }
                } else {
                    console.log('❌ 已公开投稿接口异常');
                    console.log(`   错误信息: ${publicResponse.data?.msg || '未知错误'}`);
                }
            } catch (publicError) {
                console.log('❌ 已公开投稿接口调用失败');
                console.log(`   错误: ${publicError.message}`);
            }
            
            // 5. 综合数据分析
            console.log('\n5️⃣ 综合数据分析...');
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
                
                const pendingData = pendingRes.data?.data || [];
                const publicData = publicRes.data?.data || [];
                const totalData = [...pendingData, ...publicData];
                
                console.log('📊 投稿数据汇总:');
                console.log(`   待审核: ${pendingData.length} 条`);
                console.log(`   已公开: ${publicData.length} 条`);
                console.log(`   总计: ${totalData.length} 条`);
                
                // 按状态分类统计
                const statusStats = {};
                totalData.forEach(item => {
                    const status = item.status;
                    statusStats[status] = (statusStats[status] || 0) + 1;
                });
                
                console.log('\n📈 状态分布:');
                Object.keys(statusStats).forEach(status => {
                    const statusText = {0: '待审核', 1: '已公开', 2: '被拒绝'}[status] || `未知状态(${status})`;
                    console.log(`   ${statusText}: ${statusStats[status]} 条`);
                });
                
                // 如果没有数据，建议创建测试数据
                if (totalData.length === 0) {
                    console.log('\n💡 建议:');
                    console.log('   数据库中暂无投稿数据');
                    console.log('   可以创建测试投稿来验证功能');
                }
                
            } catch (analysisError) {
                console.log('❌ 数据分析失败:', analysisError.message);
            }
            
        } else {
            console.log('❌ 管理员登录失败');
            console.log(`   错误信息: ${loginResponse.data?.msg || '未知错误'}`);
            console.log('\n💡 解决方案:');
            console.log('   1. 确认管理员账户 testuser3/123123 是否存在');
            console.log('   2. 检查用户权限配置');
        }
        
    } catch (error) {
        console.log('❌ 检查过程中发生错误:', error.message);
        if (error.response) {
            console.log('   响应状态:', error.response.status);
            console.log('   错误详情:', JSON.stringify(error.response.data, null, 2));
        }
    }
    
    console.log('\n=== 🎯 检查完成 ===');
    
    // 提供解决方案建议
    console.log('\n📋 常见问题解决方案:');
    console.log('1. 如果显示"后端服务不可用" - 请启动Spring Boot应用');
    console.log('2. 如果显示"管理员登录失败" - 检查账户和权限配置');
    console.log('3. 如果显示"接口异常" - 检查数据库连接和表结构');
    console.log('4. 如果数据显示为空 - 可以创建测试投稿数据');
}

// 执行检查
runDisclosureCheck();