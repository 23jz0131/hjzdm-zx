#!/bin/bash
# 部署前检查脚本

echo "🔍 部署前检查清单"
echo "=================="

echo "1. 检查Dockerfile配置..."
if [ -f "Dockerfile.hjzdm-backend" ]; then
    echo "✅ Dockerfile.hjzdm-backend 存在"
else
    echo "❌ Dockerfile.hjzdm-backend 不存在"
fi

echo "2. 检查render.yaml配置..."
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml 存在"
    # 检查端口配置
    if grep -q "PORT.*9090" render.yaml; then
        echo "✅ 端口配置正确 (9090)"
    else
        echo "❌ 端口配置可能有问题"
    fi
else
    echo "❌ render.yaml 不存在"
fi

echo "3. 检查必要文件..."
REQUIRED_FILES=("pom.xml" "src/main/java")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
    fi
done

echo ""
echo "📋 部署步骤:"
echo "1. git add ."
echo "2. git commit -m 'Fix health check timeout and port configuration'"
echo "3. git push origin main"
echo "4. 在Render Dashboard中重新部署"
echo ""
echo "⏰ 预计部署时间: 5-10分钟"