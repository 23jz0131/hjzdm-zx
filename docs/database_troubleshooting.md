# 数据库故障排除指南

## 常见问题

### 1. 个人信息获取失败
- **症状**: 页面显示 "データ取得に失敗しました。後ほど再試行してください"
- **可能原因**:
  - JWT令牌过期或无效
  - 数据库连接问题
  - 用户表中缺少对应ID的记录
  - 网络连接不稳定

### 2. 数据库连接测试
- 使用 `/db-test/test-connection` 端点测试数据库连接
- 使用 `/db-test/user-count` 获取用户总数
- 使用 `/db-test/find-user?userId=X` 查找特定用户

### 3. JWT令牌问题
- 检查前端localStorage中的token是否有效
- 确认后端JWT配置是否正确
- 验证令牌中的userId是否与数据库中的用户匹配

## 诊断步骤

### 步骤1: 检查数据库连接
1. 访问 `/db-test/test-connection` 确认基本连接
2. 访问 `/db-test/user-count` 检查用户表是否可访问

### 步骤2: 检查用户数据
1. 从前端获取JWT令牌
2. 解析令牌获取userId
3. 使用 `/db-test/find-user?userId=X` 查找用户

### 步骤3: 检查认证流程
1. 确认JWT拦截器工作正常
2. 验证BaseContext是否正确设置userId
3. 检查UserService.getUserProfile方法

## 日志调试

启用以下日志级别以获得更多调试信息：

```yaml
logging:
  level:
    com.wray.hjzdm.service.impl.UserServiceImpl: DEBUG
    com.wray.hjzdm.config.JwtTokenUserInterceptor: DEBUG
    org.springframework.web: DEBUG
```

## 前端诊断工具

在个人页面中提供了以下诊断按钮：
- **DB接続テスト**: 测试数据库连接
- **ユーザー診断**: 诊断当前用户信息
- **再読み込み**: 手动重试获取数据