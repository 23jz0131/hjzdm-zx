const fs = require('fs');
const path = require('path');

console.log('🔍 检查Render部署配置...\n');

// 检查render.yaml
console.log('📄 render.yaml 配置检查:');
try {
    const renderConfig = fs.readFileSync('./render.yaml', 'utf8');
    console.log('✅ render.yaml 文件存在');
    
    // 检查关键配置
    if (renderConfig.includes('healthCheckPath: /actuator/health')) {
        console.log('✅ 健康检查路径配置正确');
    } else {
        console.log('❌ 缺少健康检查配置');
    }
    
    if (renderConfig.includes('PORT: 8080')) {
        console.log('✅ 端口配置正确');
    } else {
        console.log('⚠️  端口配置可能需要调整');
    }
    
} catch (error) {
    console.log('❌ render.yaml 文件不存在或读取失败');
}

console.log('\n🔧 需要您在Render Dashboard配置的环境变量:');
console.log('================================================');

const requiredEnvVars = [
    'DATABASE_URL',
    'DB_USERNAME', 
    'DB_PASSWORD',
    'RAKUTEN_APP_ID',
    'RAKUTEN_APPLICATION_SECRET',
    'RAKUTEN_AFFILIATE_ID',
    'YAHOO_CLIENT_ID',
    'YAHOO_SECRET'
];

requiredEnvVars.forEach(envVar => {
    console.log(`• ${envVar}`);
});

console.log('\n💡 操作步骤:');
console.log('1. 登录 https://dashboard.render.com/');
console.log('2. 找到您的 hjzdm-ecommerce 应用');
console.log('3. 点击 "Environment Variables" 选项卡');
console.log('4. 逐个添加上面列出的环境变量');
console.log('5. 保存后重新部署应用');

console.log('\n🎯 最重要的环境变量值:');
console.log('DATABASE_URL: jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&requireSSL=true&verifyServerCertificate=false&allowPublicKeyRetrieval=true');
console.log('DB_USERNAME: 2eXmMXiGeCt9iz7.root');
console.log('(其他值需要您提供实际的API密钥)');