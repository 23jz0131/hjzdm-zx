// 系统状态检查脚本
console.log('=== 系统状态检查 ===');

// 检查端口占用情况
const { exec } = require('child_process');

console.log('检查端口占用情况...');

exec('netstat -ano | findstr :9090', (error, stdout, stderr) => {
  if (error) {
    console.log('检查9090端口时出错:', error.message);
    return;
  }
  if (stdout) {
    console.log('9090端口已被占用:');
    console.log(stdout);
  } else {
    console.log('9090端口未被占用');
  }
  
  exec('netstat -ano | findstr :3000', (error2, stdout2, stderr2) => {
    if (error2) {
      console.log('检查3000端口时出错:', error2.message);
      return;
    }
    if (stdout2) {
      console.log('3000端口已被占用:');
      console.log(stdout2);
    } else {
      console.log('3000端口未被占用');
    }
    
    console.log('\n=== 检查完成 ===');
  });
});