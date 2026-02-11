# 🚀 TiDB Cloud 数据库快速设置指南

## ✅ 配置已完成
数据库配置已成功更新为你的 TiDB Cloud 实例！

## 🔑 密码配置 - 请选择一种方式

### 方式 1: 环境变量（推荐）
```bash
# Windows
set TIDB_PASSWORD=你的实际密码

# Linux/Mac
export TIDB_PASSWORD=你的实际密码
```

### 方式 2: 直接修改配置文件
编辑 `src/main/resources/application.yaml`：
```yaml
password: 你的实际密码  # 替换 <PASSWORD>
```

## 🧪 连接测试

### Windows 用户
```cmd
# 双击运行或在命令行执行
test-db-connection.bat
```

### Linux/Mac 用户
```bash
chmod +x test-db-connection.sh
./test-db-connection.sh
```

### 启动应用测试
```bash
# 使用8080端口启动
mvn spring-boot:run

# 或使用启动脚本
start-8080.bat
```

## 📋 连接信息
- **连接字符串**: `mysql://2eXmMXiGeCt9iz7.root:你的密码@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500`
- **主机**: `gateway01.ap-northeast-1.prod.aws.tidbcloud.com`
- **端口**: `4000`
- **数据库**: `fortune500`
- **用户名**: `2eXmMXiGeCt9iz7.root`

## 🔧 配置文件
- **主配置**: `src/main/resources/application.yaml`
- **环境变量示例**: `.env.example`
- **连接测试**: `test-db-connection.bat` (Windows) / `test-db-connection.sh` (Linux/Mac)

## ✨ 额外功能
- ✅ 自动连接测试（应用启动时）
- ✅ SSL/TLS 安全连接
- ✅ 连接池优化
- ✅ 详细错误日志
- ✅ 环境变量支持

## 🚨 重要提醒
- 请务必将 `<PASSWORD>` 替换为你的真实密码
- 不要在代码中硬编码密码（建议使用环境变量）
- 确保网络可以访问 TiDB Cloud 端点

## 📞 如果遇到问题
1. 检查密码是否正确
2. 确认网络连接正常
3. 查看应用启动日志
4. 运行连接测试脚本