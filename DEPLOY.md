# 网站上线部署指南 (Deployment Guide)

为了让大家都能通过固定的网址访问您的网站，并且保证24小时可用，您需要将网站部署到真正的服务器上。

## 方案对比

| 方案 | 稳定性 | 成本 | 难度 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **方案一：云服务器 (推荐)** | 高 (24小时在线) | 约 30-50元/月 | 中 | 正式运营、长期使用 |
| **方案二：本地 + 内网穿透** | 低 (依赖电脑开机) | 免费 或 低 | 低 | 临时测试、给朋友看 |

---

## 方案一：使用云服务器 (正式上线)

这是最正规的做法。

### 1. 准备工作
*   **购买域名**: 在阿里云、腾讯云或 GoDaddy 购买一个域名 (例如 `hjzdm.com`)。
*   **购买服务器 (VPS)**: 推荐使用 Linux 系统 (Ubuntu 20.04 或 CentOS 7)。
    *   阿里云/腾讯云 (国内需要备案)
    *   AWS / DigitalOcean / Vultr (海外无需备案)

### 2. 服务器环境安装
在服务器上运行以下命令安装必要软件：

```bash
# Ubuntu 示例
sudo apt update
sudo apt install openjdk-8-jdk nginx -y
```

### 3. 部署后端 (Java)
1.  在本地运行 `mvn clean package` 打包项目。
2.  生成的 jar 包 (`target/HJZDM-0.0.1-SNAPSHOT.jar`) 上传到服务器。
3.  在服务器上后台运行：
    ```bash
    nohup java -jar HJZDM-0.0.1-SNAPSHOT.jar > log.txt 2>&1 &
    ```

### 4. 部署前端 (React)
1.  修改本地 `frontend/hjzdm-frontend/src/services/api.ts`，将 API 地址改为您的服务器域名/IP。
2.  在本地运行 `npm run build` 生成 `build` 文件夹。
3.  将 `build` 文件夹上传到服务器的 `/var/www/html` 目录。
4.  配置 Nginx (`/etc/nginx/sites-available/default`) 指向该目录。

---

## 方案二：Cloudflare Tunnel (家庭服务器)

如果您不想买服务器，可以使用 Cloudflare Tunnel 将您现在的电脑变成服务器。比 `localtunnel` 更稳定，且域名固定。

### 1. 准备工作
*   **购买域名**: 必须拥有一个域名。
*   **注册 Cloudflare**: 将域名接入 Cloudflare (免费)。

### 2. 安装 Cloudflared
1.  在您的电脑上下载并安装 `cloudflared`。
2.  登录 Cloudflare 建立隧道 (Tunnel)。
3.  配置隧道将 `localhost:3000` (前端) 和 `localhost:9090` (后端) 映射到您的域名 (如 `www.hjzdm.com` 和 `api.hjzdm.com`)。

### 3. 保持运行
*   您的电脑必须保持开机及联网，别人才能访问。

---

## 下一步建议
如果您准备好购买服务器，我可以为您生成详细的 `Dockerfile` 和部署脚本，让您一键部署。
