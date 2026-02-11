# 云端数据库切换完整指南

## 📋 当前状态
- **本地账户**: testuser3/123123 (可正常使用)
- **云端账户**: testuser3/123123 (存储在TiDB Cloud)
- **目标**: 切换到云端数据库以访问原有数据

## 🚀 切换步骤

### 步骤1: 停止当前服务
```powershell
# 在当前终端按 Ctrl+C 停止服务
```

### 步骤2: 切换到云端数据库
```powershell
# 运行切换脚本
./switch_to_cloud_db.ps1
```

### 步骤3: 验证连接
```powershell
# 等待系统启动完成后，在新终端运行
node verify_cloud_db.js
```

## 🔧 可用工具

### 1. 自动切换脚本
- `switch_to_cloud_db.ps1` - 一键切换到云端数据库
- 自动激活 `prod` profile
- 使用 `application-prod.yml` 配置

### 2. 验证脚本
- `verify_cloud_db.js` - 验证云端数据库连接
- 测试账户登录
- 检查数据完整性

### 3. 准备脚本
- `prepare_cloud_switch.js` - 显示切换准备信息

## 📊 数据库配置详情

**云端数据库信息:**
- **主机**: gateway01.ap-northeast-1.prod.aws.tidbcloud.com
- **端口**: 4000
- **数据库**: fortune500
- **用户名**: 2eXmMXiGeCt9iz7.root
- **配置文件**: application-prod.yml

## ⚠️ 注意事项

1. **数据隔离**: 本地H2数据库和云端TiDB数据库完全独立
2. **端口变更**: 云端配置使用8080端口（原为9090）
3. **配置激活**: 需要设置 `SPRING_PROFILES_ACTIVE=prod`
4. **网络要求**: 需要能访问TiDB Cloud服务

## 🎯 预期结果

切换成功后:
- ✅ 可使用原有的testuser3账户登录
- ✅ 可访问云端的投稿信息
- ✅ 数据持久化存储在云端
- ✅ 服务运行在 http://localhost:8080

## 🔧 故障排除

如遇问题:
1. 检查网络连接到TiDB Cloud
2. 确认数据库凭证正确
3. 查看启动日志中的错误信息
4. 验证application-prod.yml配置

## 🔄 回退方案

如需回到本地数据库:
```powershell
# 停止云端服务
# 重新运行本地启动脚本
./start-9090.bat
```