# MyBatis Plus缓存清理和强制刷新方案

## 问题分析
虽然User实体类已经删除了gender、age、birthDate字段，但MyBatis Plus的BaseMapper仍然在生成包含这些字段的SQL查询。

## 解决方案

### 1. 彻底清理缓存
```bash
# 删除所有编译输出
rd /s /q target
# 清理Maven缓存
mvn clean
```

### 2. 强制重新生成MyBatis映射
在UserMapper.java中添加@TableField注解来明确指定字段映射：

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 可以在这里添加自定义查询方法
    // 避免使用BaseMapper的默认实现
}
```

### 3. 检查其他可能引用这些字段的地方
- UserServiceImpl中的查询逻辑
- 其他Service类中可能的引用
- Controller层的参数绑定

### 4. 验证SQL生成
启动应用后，检查日志中的SQL语句是否还包含这些字段。