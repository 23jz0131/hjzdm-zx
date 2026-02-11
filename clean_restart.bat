@echo off
echo === 清理并重启服务 ===

echo 1. 终止现有Java进程...
taskkill /f /im java.exe >nul 2>&1

echo 2. 清理Maven缓存...
cd /d "C:\Users\3jz\Desktop\ANQUANBIYEZHIZUO"
mvn clean >nul 2>&1

echo 3. 重新编译项目...
mvn compile >nul 2>&1

echo 4. 启动Spring Boot应用...
mvn spring-boot:run

pause