const axios = require('axios');

async function checkDatabaseStatus() {
    console.log('🔍 开始检查数据库投稿数据状态...\n');
    
    try {
        // 1. 管理员登录
        console.log('1. 尝试管理员登录...');
        const loginResponse = await axios.post('http://localhost:9090/user/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ 管理员登录成功\n');
        
        // 2. 获取所有投稿数据
        console.log('2. 获取所有投稿数据...');
        const disclosureResponse = await axios.get('http://localhost:9090/disclosure/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const disclosures = disclosureResponse.data.data || [];
        console.log(`📊 数据库中共有 ${disclosures.length} 条投稿记录\n`);
        
        // 3. 分类统计
        const stats = {
            total: disclosures.length,
            pending: disclosures.filter(d => d.status === 0).length,
            approved: disclosures.filter(d => d.status === 1).length,
            rejected: disclosures.filter(d => d.status === 2).length
        };
        
        console.log('📈 投稿状态统计:');
        console.log(`   总计: ${stats.total} 条`);
        console.log(`   待审核: ${stats.pending} 条`);
        console.log(`   已通过: ${stats.approved} 条`);
        console.log(`   被拒绝: ${stats.rejected} 条\n`);
        
        // 4. 显示详细信息
        if (disclosures.length > 0) {
            console.log('📄 投稿详情:');
            disclosures.slice(0, 5).forEach((disclosure, index) => {
                const statusMap = {0: '待审核', 1: '已通过', 2: '被拒绝'};
                console.log(`${index + 1}. [${statusMap[disclosure.status]}] ${disclosure.title}`);
                console.log(`   提交者: ${disclosure.username || '未知'}`);
                console.log(`   时间: ${disclosure.createTime}`);
                console.log(`   内容: ${disclosure.content?.substring(0, 50)}...\n`);
            });
            
            if (disclosures.length > 5) {
                console.log(`... 还有 ${disclosures.length - 5} 条投稿\n`);
            }
        } else {
            console.log('⚠️ 数据库中暂无投稿数据\n');
            console.log('💡 建议:');
            console.log('   1. 使用普通用户账号提交一些测试投稿');
            console.log('   2. 或者运行初始化脚本添加测试数据\n');
        }
        
        // 5. 检查用户数据
        console.log('3. 检查用户数据...');
        const userResponse = await axios.get('http://localhost:9090/user/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const users = userResponse.data.data || [];
        console.log(`👥 系统中共有 ${users.length} 个用户\n`);
        
        // 结论
        console.log('🎯 诊断结论:');
        if (disclosures.length === 0) {
            console.log('🔴 问题是: 数据库中确实没有投稿数据');
            console.log('🟢 解决方案: 需要用户提交投稿或添加测试数据');
        } else if (stats.pending === 0 && stats.approved === 0 && stats.rejected === 0) {
            console.log('🔴 问题是: 投稿状态数据异常');
            console.log('🟢 解决方案: 检查数据库字段定义和数据完整性');
        } else {
            console.log('🟢 数据库状态正常，投稿数据存在');
            console.log('🟡 如果前端仍不显示，可能是前端代码问题');
        }
        
    } catch (error) {
        console.error('❌ 检查过程中出现错误:');
        console.error('错误信息:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

checkDatabaseStatus();