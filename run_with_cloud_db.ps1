$password = Read-Host -Prompt "Please enter your TiDB database password"
$env:SPRING_DATASOURCE_DRIVER_CLASS_NAME = "com.mysql.cj.jdbc.Driver"
$env:SPRING_DATASOURCE_URL = "jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/test?sslMode=VERIFY_IDENTITY&useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai"
$env:SPRING_DATASOURCE_USERNAME = "2eXmMXiGeCt9iz7.root"
$env:SPRING_DATASOURCE_PASSWORD = $password

Write-Host "Starting HJZDM with TiDB Cloud Database..."
mvn spring-boot:run