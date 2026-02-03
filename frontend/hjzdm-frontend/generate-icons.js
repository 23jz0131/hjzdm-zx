// Base64图标生成工具
// 运行此脚本将图片转换为Base64格式

const fs = require('fs');
const path = require('path');

const imageDir = './public/images';
const outputFile = './src/utils/icons.js';

// 确保输出目录存在
if (!fs.existsSync('./src/utils')) {
  fs.mkdirSync('./src/utils', { recursive: true });
}

const icons = {};

// 读取所有PNG图片并转换为Base64
fs.readdirSync(imageDir).forEach(file => {
  if (file.endsWith('.png')) {
    const filePath = path.join(imageDir, file);
    const imageData = fs.readFileSync(filePath);
    const base64 = imageData.toString('base64');
    const iconName = path.basename(file, '.png');
    icons[iconName] = `data:image/png;base64,${base64}`;
  }
});

// 生成JS文件
const jsContent = `
// 自动生成的图标Base64数据
export const icons = ${JSON.stringify(icons, null, 2)};

// 获取图标函数
export const getIcon = (name, isActive = false) => {
  const iconName = isActive ? name.replace('dianzan', 'yidianzan').replace('shoucang', 'yishoucang') : name;
  return icons[iconName] || icons[name] || '';
};

// 预定义的图标名称
export const ICON_NAMES = {
  LIKE: 'dianzan',
  COLLECT: 'shoucang', 
  COMMENT: 'pinglun'
};
`;

fs.writeFileSync(outputFile, jsContent);
console.log('图标Base64文件生成完成:', outputFile);