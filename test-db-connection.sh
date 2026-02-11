#!/bin/bash

# TiDB Cloud 连接测试脚本
# 请先确保已替换 .env 文件中的密码

echo "🔧 TiDB Cloud 连接测试"
echo "========================="

# 检查环境变量
if [ -z "$TIDB_PASSWORD" ]; then
    echo "⚠️  请设置 TIDB_PASSWORD 环境变量"
    echo "   export TIDB_PASSWORD=your_actual_password"
    echo "   或者创建 .env 文件"
    exit 1
fi

# 构建 JDBC URL
JDBC_URL="jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&requireSSL=true&verifyServerCertificate=false&allowPublicKeyRetrieval=true"

echo "📡 连接信息:"
echo "   Host: gateway01.ap-northeast-1.prod.aws.tidbcloud.com"
echo "   Port: 4000"
echo "   Database: fortune500"
echo "   Username: 2eXmMXiGeCt9iz7.root"
echo ""

echo "🧪 开始测试连接..."

# 如果安装了 MySQL 客户端，可以进行简单测试
if command -v mysql &> /dev/null; then
    mysql -h gateway01.ap-northeast-1.prod.aws.tidbcloud.com -P 4000 -u 2eXmMXiGeCt9iz7.root -p"$TIDB_PASSWORD" fortune500 -e "SELECT 'Connection Successful!' as status, VERSION() as version;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ 数据库连接成功！"
    else
        echo "❌ 数据库连接失败！"
        echo "   请检查密码和网络连接"
    fi
else
    echo "ℹ️  未安装 MySQL 客户端，跳过连接测试"
    echo "   可以通过启动 Spring Boot 应用来测试连接"
fi

echo ""
echo "🚀 启动应用测试:"
echo "   mvn spring-boot:run"
echo ""
echo "📝 完整连接字符串:"
echo "   mysql://2eXmMXiGeCt9iz7.root:your_password@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500"