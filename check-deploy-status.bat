@echo off
echo ================================
echo HJZDM 部署状态检查
echo ================================

echo 检查本地Git状态...
git status

echo.
echo 检查最近提交...
git log --oneline -3

echo.
echo 检查远程分支...
git branch -r

echo.
echo ================================
echo 部署检查完成！
echo ================================
echo 请在Render控制台执行以下操作：
echo 1. 登录 https://dashboard.render.com
echo 2. 找到 hjzdm-ecommerce 服务
echo 3. 点击 Manual Deploy ^> Clear build cache ^& deploy
echo ================================
pause