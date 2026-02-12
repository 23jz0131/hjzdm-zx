@echo off
echo ================================
echo HJZDM Vercel 部署脚本
echo ================================

echo 切换到前端目录...
cd frontend\hjzdm-frontend

echo 安装依赖...
npm install

echo 构建生产版本...
npm run build

echo 部署到Vercel...
echo 请确保已安装Vercel CLI: npm install -g vercel
echo 然后运行: vercel --prod

pause