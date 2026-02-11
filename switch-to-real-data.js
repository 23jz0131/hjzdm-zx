#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

console.log('🔄 切换到真实数据模式...\n');

// 检查当前运行的服务
function checkCurrentServices() {
    console.log('🔍 检查当前运行的服务...');
    try {
        const result = execSync('netstat -ano | findstr :9090', { encoding: 'utf8' });
        if (result.includes('LISTENING')) {
            console.log('✅ 发现9090端口服务正在运行');
            // 提取PID并终止
            const lines = result.split('\n');
            for (const line of lines) {
                if (line.includes('LISTENING')) {
                    const pid = line.trim().split(/\s+/)[4];
                    if (pid && !isNaN(pid)) {
                        console.log(`🛑 终止PID ${pid} 的服务...`);
                        execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
                        break;
                    }
                }
            }
        }
    } catch (error) {
        console.log('ℹ️  9090端口当前未被占用');
    }
}

// 启动真实数据服务
function startRealDataService() {
    console.log('\n🚀 启动真实数据服务...');
    
    const realDataServerPath = path.join(__dirname, 'real-data-server.js');
    
    if (!fs.existsSync(realDataServerPath)) {
        console.error('❌ 找不到真实数据服务器文件: real-data-server.js');
        process.exit(1);
    }
    
    // 检查Node.js依赖
    try {
        execSync('node --version', { stdio: 'pipe' });
        console.log('✅ Node.js 环境检查通过');
    } catch (error) {
        console.error('❌ 请确保已安装Node.js');
        process.exit(1);
    }
    
    // 检查必要的npm包
    const requiredPackages = ['express', 'cors'];
    for (const pkg of requiredPackages) {
        try {
            require.resolve(pkg);
            console.log(`✅ 依赖包 ${pkg} 已安装`);
        } catch (error) {
            console.log(`⚠️  安装依赖包 ${pkg}...`);
            execSync(`npm install ${pkg}`, { stdio: 'inherit' });
        }
    }
    
    // 启动真实数据服务
    const child = spawn('node', [realDataServerPath], {
        stdio: 'inherit',
        cwd: __dirname
    });
    
    child.on('spawn', () => {
        console.log('✅ 真实数据服务启动成功！');
        console.log('🌐 服务地址: http://localhost:9090');
        console.log('📝 可用API端点:');
        console.log('   POST /goods/compare - 真实商品比价');
        console.log('   POST /goods/search - 真实商品搜索');
        console.log('   POST /goods/pageAll - 真实全商品');
        console.log('   GET  /user/me - 真实用戶信息');
    });
    
    child.on('error', (error) => {
        console.error('❌ 启动真实数据服务失败:', error.message);
        process.exit(1);
    });
    
    // 优雅关闭处理
    process.on('SIGINT', () => {
        console.log('\n🛑 正在关闭真实数据服务...');
        child.kill();
        process.exit(0);
    });
}

// 测试真实数据API
function testRealDataAPI() {
    console.log('\n🧪 测试真实数据API...');
    
    setTimeout(() => {
        const http = require('http');
        
        const postData = JSON.stringify({
            query: 'iPhone'
        });
        
        const options = {
            hostname: 'localhost',
            port: 9090,
            path: '/goods/compare',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            console.log(`📡 响应状态码: ${res.statusCode}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ API测试成功！');
                    console.log(`📦 响应码: ${jsonData.code}`);
                    console.log(`📊 数据项数: ${jsonData.data ? jsonData.data.length : 0}`);
                    
                    if (jsonData.data && jsonData.data.length > 0) {
                        const group = jsonData.data[0];
                        console.log(`\n🛒 商品组: ${group.goodsName}`);
                        console.log(`💰 最低价格: ¥${group.lowestPrice}`);
                        console.log(`🏪 最低平台: ${group.lowestPlatform}`);
                        
                        // 统计平台分布
                        const platformStats = {};
                        if (group.goodsList) {
                            group.goodsList.forEach(item => {
                                platformStats[item.mallType] = (platformStats[item.mallType] || 0) + 1;
                            });
                        }
                        console.log('📊 平台分布:', platformStats);
                    }
                } catch (error) {
                    console.error('❌ 响应解析失败:', error.message);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ API测试失败:', error.message);
        });
        
        req.write(postData);
        req.end();
        
    }, 2000); // 等待服务启动
}

// 主执行流程
function main() {
    try {
        checkCurrentServices();
        startRealDataService();
        testRealDataAPI();
        
        console.log('\n🎉 真实数据模式切换完成！');
        console.log('💡 提示: 按 Ctrl+C 可以停止服务');
        
    } catch (error) {
        console.error('❌ 切换过程出错:', error.message);
        process.exit(1);
    }
}

// 执行主函数
if (require.main === module) {
    main();
}

module.exports = { checkCurrentServices, startRealDataService, testRealDataAPI };