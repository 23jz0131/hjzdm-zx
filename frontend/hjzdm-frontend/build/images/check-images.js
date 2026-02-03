// 图片资源部署检查工具
// 在浏览器控制台运行此脚本来检查图片是否正常加载

const imageFiles = [
  '/images/dianzan.png',
  '/images/yidianzan.png', 
  '/images/shoucang.png',
  '/images/yishoucang.png',
  '/images/pinglun.png'
];

console.log('开始检查图片资源加载情况...');

imageFiles.forEach(imgSrc => {
  const img = new Image();
  img.onload = () => {
    console.log(`✅ ${imgSrc} - 加载成功`);
  };
  img.onerror = () => {
    console.error(`❌ ${imgSrc} - 加载失败`);
  };
  img.src = imgSrc;
});

// 检查当前页面中的图片元素
setTimeout(() => {
  const images = document.querySelectorAll('img[src*="/images/"]');
  console.log(`页面中共找到 ${images.length} 个图片元素:`);
  images.forEach((img, index) => {
    console.log(`${index + 1}. ${img.src} - ${img.complete ? '已加载' : '未加载'}`);
  });
}, 1000);