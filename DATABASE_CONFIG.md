# TiDB Cloud 数据库配置指南

## 配置已更新
数据库连接已更新为你的 TiDB Cloud 实例：

- **HOST**: gateway01.ap-northeast-1.prod.aws.tidbcloud.com
- **PORT**: 4000  
- **DATABASE**: fortune500
- **USERNAME**: 2eXmMXiGeCt9iz7.root

## 需要手动替换的占位符

在 `src/main/resources/application.yaml` 文件中，请替换以下占位符：

1. **密码**: 将 `<PASSWORD>` 替换为你的实际数据库密码
2. **CA证书路径**: 将 `<CA_PATH>` 替换为CA证书文件的完整路径

## CA证书配置

如果需要使用SSL证书验证，请：

1. 下载 TiDB Cloud 的 CA 证书文件
2. 将文件保存在安全位置（例如：`/path/to/tidb-ca.pem`）
3. 在配置文件中更新路径：`file:/path/to/tidb-ca.pem`

## 连接测试

应用启动时会自动测试数据库连接，检查日志输出：
```
=== 数据库连接测试 ===
连接状态: TiDB Cloud Connection Successful!
数据库版本: [TiDB版本信息]
数据库中的表数量: [表数量]
=== 数据库连接测试完成 ===
```

## 故障排除

如果连接失败，请检查：

1. **网络连接**: 确保可以访问 TiDB Cloud 端点
2. **密码正确**: 验证用户名和密码
3. **防火墙**: 检查端口4000是否开放
4. **SSL配置**: 如果使用CA证书，确保证书文件路径正确

## 安全建议

- 不要在代码中硬编码密码，建议使用环境变量
- CA证书文件应该有适当的文件权限
- 定期更新数据库密码
- 使用最小权限原则配置数据库用户