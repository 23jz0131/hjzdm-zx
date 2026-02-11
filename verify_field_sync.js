const mysql = require('mysql2');

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'hjzdm'
};

console.log('=== 数据库字段完整性验证 ===\n');

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err);
        return;
    }
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 检查USER表结构
    connection.query('DESCRIBE user', (error, results) => {
        if (error) {
            console.error('查询表结构失败:', error);
            connection.end();
            return;
        }
        
        console.log('=== USER表当前结构 ===');
        results.forEach(row => {
            console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // 2. 检查必需字段是否存在
        const requiredFields = ['id', 'openid', 'nickname', 'name', 'phone', 'password', 'avatar', 'create_time', 'gender', 'age', 'birth_date', 'update_time'];
        const existingFields = results.map(row => row.Field.toLowerCase());
        
        console.log('\n=== 字段完整性检查 ===');
        const missingFields = [];
        const presentFields = [];
        
        requiredFields.forEach(field => {
            if (existingFields.includes(field)) {
                presentFields.push(field);
                console.log(`✅ ${field}: 存在`);
            } else {
                missingFields.push(field);
                console.log(`❌ ${field}: 缺失`);
            }
        });
        
        if (missingFields.length > 0) {
            console.log(`\n⚠️  发现 ${missingFields.length} 个缺失字段:`);
            missingFields.forEach(field => console.log(`  - ${field}`));
        } else {
            console.log('\n🎉 所有必需字段都已存在！');
        }
        
        // 3. 测试数据插入
        console.log('\n=== 测试数据操作 ===');
        const testUser = {
            name: 'test_sync_user',
            openid: 'test_openid_' + Date.now(),
            phone: '13800138000',
            password: 'encrypted_password',
            nickname: '测试同步用户',
            gender: 1,
            age: 25,
            birth_date: '1998-01-01'
        };
        
        const insertSql = `INSERT INTO user (name, openid, phone, password, nickname, gender, age, birth_date, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        const values = [
            testUser.name, testUser.openid, testUser.phone, testUser.password, 
            testUser.nickname, testUser.gender, testUser.age, testUser.birth_date
        ];
        
        connection.query(insertSql, values, (insertError, insertResult) => {
            if (insertError) {
                console.error('❌ 数据插入失败:', insertError.message);
            } else {
                console.log('✅ 数据插入成功');
                const userId = insertResult.insertId;
                console.log(`   插入用户ID: ${userId}`);
                
                // 查询验证插入的数据
                connection.query('SELECT * FROM user WHERE id = ?', [userId], (selectError, selectResult) => {
                    if (!selectError && selectResult.length > 0) {
                        const user = selectResult[0];
                        console.log('\n=== 插入数据验证 ===');
                        console.log(`   ID: ${user.id}`);
                        console.log(`   姓名: ${user.name}`);
                        console.log(`   OPENID: ${user.openid || 'NULL'}`);
                        console.log(`   手机: ${user.phone || 'NULL'}`);
                        console.log(`   性别: ${user.gender || 'NULL'}`);
                        console.log(`   年龄: ${user.age || 'NULL'}`);
                        console.log(`   生日: ${user.birth_date || 'NULL'}`);
                        
                        // 清理测试数据
                        connection.query('DELETE FROM user WHERE id = ?', [userId], (deleteError) => {
                            if (!deleteError) {
                                console.log('✅ 测试数据已清理');
                            }
                            connection.end();
                        });
                    } else {
                        console.log('❌ 数据查询验证失败');
                        connection.end();
                    }
                });
            }
        });
    });
});