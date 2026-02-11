const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = 9090;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Java后端进程引用
let javaProcess = null;

// 启动Java后端服务
function startJavaBackend() {
    console.log('🚀 启动真实Java后端服务...');
    
    const javaPath = 'java'; // 使用系统默认Java
    const jarPath = path.join(__dirname, 'target', 'hjzdm-0.0.1-SNAPSHOT.jar');
    const classpath = path.join(__dirname, 'target', 'classes');
    
    // 检查是否存在编译好的JAR文件
    const fs = require('fs');
    if (fs.existsSync(jarPath)) {
        // 使用JAR文件运行
        javaProcess = spawn(javaPath, ['-jar', jarPath], {
            cwd: __dirname,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log('📦 使用JAR文件启动后端服务');
    } else {
        // 尝试使用Maven运行
        javaProcess = spawn('mvn', ['spring-boot:run'], {
            cwd: __dirname,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log('🔧 使用Maven启动后端服务');
    }
    
    javaProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('[Java Backend]', output.trim());
        
        // 检查Spring Boot启动完成
        if (output.includes('Started HjzdmApplication') || output.includes('Tomcat started')) {
            console.log('✅ Java后端服务启动完成！');
        }
    });
    
    javaProcess.stderr.on('data', (data) => {
        console.error('[Java Backend Error]', data.toString().trim());
    });
    
    javaProcess.on('close', (code) => {
        console.log(`[Java Backend] 进程退出，退出码: ${code}`);
        javaProcess = null;
    });
    
    javaProcess.on('error', (error) => {
        console.error('[Java Backend] 启动失败:', error.message);
        console.log('💡 请确保已安装Java和Maven，并在项目根目录运行');
    });
}

// 代理请求到真实的Java后端
function proxyToJavaBackend(req, res) {
    if (!javaProcess) {
        console.log('🔄 正在启动Java后端服务...');
        startJavaBackend();
        
        // 等待服务启动
        setTimeout(() => {
            proxyRequest(req, res);
        }, 5000);
        return;
    }
    
    proxyRequest(req, res);
}

function proxyRequest(req, res) {
    const http = require('http');
    
    const options = {
        hostname: 'localhost',
        port: 8080, // Spring Boot默认端口
        path: req.originalUrl,
        method: req.method,
        headers: {
            ...req.headers,
            host: 'localhost:8080'
        }
    };
    
    // 删除可能导致问题的头部
    delete options.headers['content-length'];
    delete options.headers['connection'];
    
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (error) => {
        console.error('❌ 代理请求失败:', error.message);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                code: 503,
                message: '后端服务暂时不可用，请稍后重试',
                data: []
            });
        } else {
            res.status(500).json({
                code: 500,
                message: '服务内部错误',
                data: []
            });
        }
    });
    
    if (req.method === 'POST' || req.method === 'PUT') {
        req.pipe(proxyReq);
    } else {
        proxyReq.end();
    }
}

// 商品比价API - 直接调用真实API
app.post('/goods/compare', (req, res) => {
    console.log('🔍 真实数据 - 商品比价搜索:', req.body.query);
    proxyToJavaBackend(req, res);
});

// 商品搜索API
app.post('/goods/search', (req, res) => {
    console.log('🔍 真实数据 - 商品搜索:', req.body.query);
    proxyToJavaBackend(req, res);
});

// 全商品获取API
app.post('/goods/pageAll', (req, res) => {
    console.log('📦 真实数据 - 获取全商品');
    proxyToJavaBackend(req, res);
});

// 按名称搜索API
app.get('/goods/searchByName', (req, res) => {
    console.log('🔍 真实数据 - 按名称搜索:', req.query.query);
    proxyToJavaBackend(req, res);
});

// 商品详情API
app.get('/goods/detail', (req, res) => {
    console.log('📦 真实数据 - 商品详情查询:', req.query.goodsId);
    proxyToJavaBackend(req, res);
});

// 我的收藏API
app.post('/goods/myCollect', (req, res) => {
    console.log('❤️ 真实数据 - 我的收藏');
    proxyToJavaBackend(req, res);
});

// 我的商品API
app.post('/goods/myGoods', (req, res) => {
    console.log('🛍️ 真实数据 - 我的商品');
    proxyToJavaBackend(req, res);
});

// 用户信息API
app.get('/user/me', (req, res) => {
    console.log('👤 真实数据 - 用户信息');
    proxyToJavaBackend(req, res);
});

// 用户登录API
app.post('/user/login', (req, res) => {
    console.log('🔐 真实数据 - 用户登录:', req.body.username);
    proxyToJavaBackend(req, res);
});

// 披露列表API
app.post('/disclosure/queryPublicList', (req, res) => {
    console.log('📢 真实数据 - 披露列表');
    proxyToJavaBackend(req, res);
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        backend: javaProcess ? 'running' : 'stopped',
        message: '真实数据服务正在运行'
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`🚀 真实数据网关服务器启动 at http://localhost:${port}`);
    console.log('📡 正在连接到真实的Java后端服务...');
    console.log('💡 如果Java后端未启动，将自动尝试启动');
    
    // 立即尝试启动Java后端
    setTimeout(startJavaBackend, 1000);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务...');
    if (javaProcess) {
        javaProcess.kill();
    }
    process.exit(0);
});