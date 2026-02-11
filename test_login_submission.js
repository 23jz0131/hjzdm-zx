const puppeteer = require('puppeteer');

async function testLoginAndSubmissionView() {
    console.log('=== 测试登录和投稿查看流程 ===\n');
    
    let browser;
    try {
        // 启动浏览器
        browser = await puppeteer.launch({ 
            headless: false,
            slowMo: 50,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // 设置视口大小
        await page.setViewport({ width: 1200, height: 800 });
        
        // 监听控制台日志
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('浏览器错误:', msg.text());
            }
        });
        
        // 监听网络请求
        page.on('request', request => {
            if (request.url().includes('/user/login') || request.url().includes('/disclosure')) {
                console.log('网络请求:', request.method(), request.url());
            }
        });
        
        // 监听响应
        page.on('response', response => {
            if (response.url().includes('/user/login') || response.url().includes('/disclosure')) {
                console.log('响应状态:', response.status(), response.url());
            }
        });
        
        console.log('1. 访问登录页面...');
        await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });
        await page.waitForTimeout(2000);
        
        console.log('2. 填写登录表单...');
        await page.type('#phone', 'zhanghui');
        await page.type('#password', '123456');
        
        console.log('3. 提交登录表单...');
        await Promise.all([
            page.click('.login-button'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
        
        await page.waitForTimeout(3000);
        
        // 检查是否登录成功
        const currentUrl = page.url();
        console.log('当前页面URL:', currentUrl);
        
        if (currentUrl === 'http://localhost:3001/') {
            console.log('✅ 登录成功！');
            
            console.log('4. 导航到个人页面...');
            await page.goto('http://localhost:3001/profile', { waitUntil: 'networkidle2' });
            await page.waitForTimeout(2000);
            
            console.log('5. 查找投稿相关元素...');
            // 等待页面加载完成
            await page.waitForSelector('.feature-card', { timeout: 5000 }).catch(() => {
                console.log('⚠️ 未找到功能卡片元素');
            });
            
            // 尝试查找投稿相关的文本或元素
            const hasSubmissionText = await page.evaluate(() => {
                const textContent = document.body.textContent || '';
                return textContent.includes('投稿') || textContent.includes('ヒント') || textContent.includes('Tip');
            });
            
            if (hasSubmissionText) {
                console.log('✅ 页面包含投稿相关内容');
            } else {
                console.log('⚠️ 页面可能不包含投稿内容');
            }
            
            // 尝试导航到投稿页面
            console.log('6. 尝试访问投稿页面...');
            await page.goto('http://localhost:3001/my-tip', { waitUntil: 'networkidle2' });
            await page.waitForTimeout(2000);
            
            const tipPageUrl = page.url();
            console.log('投稿页面URL:', tipPageUrl);
            
            if (tipPageUrl.includes('my-tip')) {
                console.log('✅ 成功访问投稿页面');
                
                // 检查页面内容
                const pageContent = await page.evaluate(() => document.body.innerText);
                console.log('页面内容预览:', pageContent.substring(0, 200) + '...');
                
            } else {
                console.log('❌ 未能访问投稿页面');
            }
            
        } else {
            console.log('❌ 登录失败，当前页面:', currentUrl);
            
            // 检查是否有错误信息
            const errorElement = await page.$('.error-message');
            if (errorElement) {
                const errorMessage = await page.evaluate(el => el.textContent, errorElement);
                console.log('错误信息:', errorMessage);
            }
        }
        
        console.log('\n=== 测试完成 ===');
        console.log('浏览器窗口将保持打开状态以便手动检查');
        console.log('按 Ctrl+C 结束测试');
        
        // 保持浏览器打开
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 执行测试
testLoginAndSubmissionView();