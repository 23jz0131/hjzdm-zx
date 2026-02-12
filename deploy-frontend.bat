@echo off
echo ================================
echo HJZDM 一键部署脚本
echo ================================

echo 正在准备前端部署...
cd frontend\hjzdm-frontend

echo 安装依赖...
npm install

echo 构建生产版本...
npm run build

echo 部署到Vercel...
npx vercel --prod

echo ================================
echo 前端部署完成！
echo ================================
pause