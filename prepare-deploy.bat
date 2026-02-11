@echo off
echo ================================
echo HJZDM 部署准备脚本
echo ================================

echo 正在清理旧的构建文件...
if exist target rmdir /s /q target
if exist .dockerignore del .dockerignore

echo 创建.dockerignore文件以优化Docker构建...
echo node_modules > .dockerignore
echo .git >> .dockerignore
echo .idea >> .dockerignore
echo *.log >> .dockerignore
echo target/ >> .dockerignore
echo !target/*.jar >> .dockerignore

echo 检查Dockerfile配置...
type Dockerfile.render > nul
if %errorlevel% equ 0 (
    echo ✓ Dockerfile.render 配置正常
) else (
    echo ✗ Dockerfile.render 文件不存在
    exit /b 1
)

echo 检查render.yaml配置...
type render.yaml > nul
if %errorlevel% equ 0 (
    echo ✓ render.yaml 配置正常
) else (
    echo ✗ render.yaml 文件不存在
    exit /b 1
)

echo ================================
echo 部署准备完成！
echo ================================
echo 下一步操作：
echo 1. 提交所有更改到Git
echo 2. 推送到GitHub仓库
echo 3. 在Render控制台触发重新部署
echo ================================
pause