// 彻底清理前端缓存和构建文件
const fs = require('fs');
const path = require('path');

console.log('=== 前端缓存清理脚本 ===\n');

// 要删除的目录和文件
const cleanupPaths = [
  'node_modules/.cache',
  '.cache',
  'build',
  'dist'
];

// 当前工作目录
const frontendDir = path.join(__dirname, 'frontend', 'hjzdm-frontend');

cleanupPaths.forEach(relativePath => {
  const fullPath = path.join(frontendDir, relativePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      if (fs.lstatSync(fullPath).isDirectory()) {
        // 递归删除目录
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ 已删除目录: ${relativePath}`);
      } else {
        // 删除文件
        fs.unlinkSync(fullPath);
        console.log(`✅ 已删除文件: ${relativePath}`);
      }
    } catch (error) {
      console.log(`⚠️  删除失败 ${relativePath}: ${error.message}`);
    }
  } else {
    console.log(`ℹ️  不存在: ${relativePath}`);
  }
});

console.log('\n=== 清理完成 ===');
console.log('建议接下来执行:');
console.log('1. cd frontend/hjzdm-frontend');
console.log('2. npm start');
console.log('3. 在浏览器中按 Ctrl+F5 强制刷新');