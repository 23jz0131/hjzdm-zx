const { exec } = require('child_process');

console.log('🔍 编译测试...\n');

exec('mvn compile', (error, stdout, stderr) => {
    if (error) {
        console.error('❌ 编译失败:');
        console.error(stderr);
        return;
    }
    
    console.log('✅ 编译成功!');
    console.log('📄 输出摘要:');
    
    // 检查是否还有错误信息
    if (stderr && stderr.includes('error') || stderr.includes('エラー')) {
        console.log('⚠️  仍存在编译错误:');
        console.log(stderr);
    } else {
        console.log('🎉 无编译错误，项目可以正常运行');
    }
    
    // 显示关键成功信息
    if (stdout.includes('BUILD SUCCESS')) {
        console.log('🏆 Maven构建成功完成');
    }
});