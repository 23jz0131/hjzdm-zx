@echo off
echo ========================================
echo 上传Dockerfile到GitHub仓库
echo ========================================

REM 请修改下面的路径为您实际的GitHub仓库路径
set REPO_PATH=C:\path\to\your\github\repository

echo 正在复制Dockerfile到仓库目录...
copy "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO\Dockerfile" "%REPO_PATH%\"

echo 正在进入仓库目录...
cd /d "%REPO_PATH%"

echo 正在添加文件到Git...
git add Dockerfile

echo 正在提交更改...
git commit -m "Add Dockerfile for Java application deployment"

echo 正在推送到GitHub...
git push origin main

echo ========================================
echo 上传完成！
echo ========================================
pause