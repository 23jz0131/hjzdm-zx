const axios = require('axios');

async function prepareCloudSwitch9090() {
    console.log('=== 云端数据库切换准备 (9090端口) ===\n');
    
    console.log('📋 当前状态检查:');
    
    // 检查当前服务状态
    try {
        const response = await axios.get('http://localhost:9090/database-test/status', {
            timeout: 3000
        });
        console.log('✅ 当前后端服务运行正常 (9090端口)');
        console.log('数据库类型:', response.data.data?.databaseType || 'Unknown');
    } catch (error) {
        console.log('⚠️  当前后端服务未运行或测试接口不可用');
    }
    
    console.log('\n🔧 准备工作:');
    console.log('1. 已创建专用配置文件: application-cloud-9090.yml');
    console.log('2. 已创建切换脚本: switch_to_cloud_db_9090.ps1');
    console.log('3. 已更新验证脚本: verify_cloud_db.js');
    console.log('4. 已编写操作指南: CLOUD_DB_9090_GUIDE.md');
    
    console.log('\n🚀 切换步骤:');
    console.log('步骤1: 停止当前服务 (Ctrl+C)');
    console.log('步骤2: 运行 ./switch_to_cloud_db_9090.ps1');
    console.log('步骤3: 等待启动完成');
    console.log('步骤4: 运行 node verify_cloud_db.js 验证');
    
    console.log('\n🎯 切换后效果:');
    console.log('- 服务仍运行在 9090 端口');
    console.log('- 数据源切换到云端TiDB数据库');
    console.log('- 可使用 testuser3/123123 账户登录');
    console.log('- 可访问云端的投稿信息');
    console.log('- 前端代理配置无需更改');
    
    console.log('\n💡 注意事项:');
    console.log('- 确保网络可以访问TiDB Cloud服务');
    console.log('- 切换过程约需1-2分钟');
    console.log('- 如有问题可随时回退到本地数据库');
}

prepareCloudSwitch9090();