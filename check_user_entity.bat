@echo off
echo === User实体类状态检查 ===

cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"

echo 1. 检查User.java文件是否存在...
if exist "src\main\java\com\wray\hjzdm\entity\User.java" (
    echo    ✓ User.java 文件存在
) else (
    echo    ✗ User.java 文件不存在
    goto :error
)

echo 2. 检查是否包含gender字段...
findstr /i "gender" "src\main\java\com\wray\hjzdm\entity\User.java" >nul
if !errorlevel! equ 0 (
    echo    ✗ 发现gender字段，需要删除
    echo    文件内容预览:
    findstr /i "gender" "src\main\java\com\wray\hjzdm\entity\User.java"
    goto :error
) else (
    echo    ✓ 未发现gender字段
)

echo 3. 检查是否包含age字段...
findstr /i "age" "src\main\java\com\wray\hjzdm\entity\User.java" >nul
if !errorlevel! equ 0 (
    echo    ✗ 发现age字段，需要删除
    goto :error
) else (
    echo    ✓ 未发现age字段
)

echo 4. 检查是否包含birthDate字段...
findstr /i "birthDate" "src\main\java\com\wray\hjzdm\entity\User.java" >nul
if !errorlevel! equ 0 (
    echo    ✗ 发现birthDate字段，需要删除
    goto :error
) else (
    echo    ✓ 未发现birthDate字段
)

echo.
echo ==========================================
echo ✓ User实体类检查通过！
echo ✓ 所有多余字段均已移除
echo ✓ 符合简化数据结构的设计原则
echo ==========================================
goto :end

:error
echo.
echo ****************************************************
echo * 检查失败！User实体类中存在不应有的字段
echo * 请根据上述信息修正实体类
echo ****************************************************

:end
pause