package com.wray.hjzdm.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.sql.*;

// @SpringBootApplication
public class DatabaseChecker {
    
    public static void main(String[] args) throws SQLException {
        ConfigurableApplicationContext context = SpringApplication.run(DatabaseChecker.class, args);
        
        try (Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/hjzdm?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
                "root", "123456")) {
            
            System.out.println("数据库连接成功");
            
            // 检查DISCLOSURE表结构
            System.out.println("检查DISCLOSURE表结构:");
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet columns = metaData.getColumns(null, null, "DISCLOSURE", null);
            
            System.out.printf("%-20s %-15s %-10s%n", "COLUMN_NAME", "DATA_TYPE", "NULLABLE");
            System.out.println("---------------------------------------------");
            
            while (columns.next()) {
                String columnName = columns.getString("COLUMN_NAME");
                String dataType = columns.getString("TYPE_NAME");
                String nullable = columns.getString("NULLABLE").equals("1") ? "YES" : "NO";
                
                System.out.printf("%-20s %-15s %-10s%n", columnName, dataType, nullable);
            }
            
            // 检查数据行数
            Statement stmt = conn.createStatement();
            ResultSet countRs = stmt.executeQuery("SELECT COUNT(*) FROM DISCLOSURE");
            if (countRs.next()) {
                int rowCount = countRs.getInt(1);
                System.out.println("DISCLOSURE表共有 " + rowCount + " 条记录");
            }
            
        } catch (Exception e) {
            System.err.println("数据库检查失败: " + e.getMessage());
            e.printStackTrace();
        } finally {
            context.close();
        }
    }
}