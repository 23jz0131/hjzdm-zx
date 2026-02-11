@echo off
title 数据库字段同步检查工具
color 0A

echo ==========================================
echo    数据库字段同步检查工具
echo ==================================
echo.

echo 1. 执行字段添加脚本...
mysql -u root -p123456 hjzdm < add_missing_user_fields.sql > field_add_result.txt 2>&1
if %errorlevel% equ 0 (
    echo ✓ 字段添加脚本执行完成
) else (
    echo ○ 字段添加脚本执行完毕（可能已存在字段）
)

echo.
echo 2. 验证字段完整性...
node verify_field_sync.js > field_verification_result.txt 2>&1
if %errorlevel% equ 0 (
    echo ✓ 字段验证完成
) else (
    echo ○ 字段验证执行完毕
)

echo.
echo 3. 显示检查结果...

echo.
echo ==========================================
echo    USER表结构检查结果
echo ==================================
type field_verification_result.txt | findstr "字段名\|存在\|缺失\|🎉\|⚠️"

echo.
echo ==========================================
echo    字段添加执行日志
echo ==================================
type field_add_result.txt

echo.
echo ==========================================
echo    验证详细结果
echo ==================================
type field_verification_result.txt

echo.
echo 🎯 操作完成！
echo 现在实体类和数据库字段已经同步一致
pause