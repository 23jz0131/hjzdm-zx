import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnectionTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/fortune500?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8&requireSSL=true&verifyServerCertificate=false&allowPublicKeyRetrieval=true";
        String username = "2eXmMXiGeCt9iz7.root";
        String password = "00KpH8EmSBk7A3ET";
        
        System.out.println("Testing database connection...");
        System.out.println("URL: " + url);
        System.out.println("Username: " + username);
        
        try {
            System.out.println("Loading MySQL driver...");
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            System.out.println("Establishing connection...");
            Connection connection = DriverManager.getConnection(url, username, password);
            
            System.out.println("SUCCESS: Database connection established!");
            System.out.println("Database name: " + connection.getCatalog());
            System.out.println("Database product: " + connection.getMetaData().getDatabaseProductName());
            System.out.println("Database version: " + connection.getMetaData().getDatabaseProductVersion());
            
            connection.close();
            System.out.println("Connection closed");
            
        } catch (ClassNotFoundException e) {
            System.err.println("ERROR: MySQL driver not found: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("ERROR: Database connection failed: " + e.getMessage());
            System.err.println("SQL State: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
        } catch (Exception e) {
            System.err.println("ERROR: Other exception: " + e.getMessage());
            e.printStackTrace();
        }
    }
}