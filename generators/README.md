## 环境搭建指南

### 搭建NodeJS环境
安装NodeJS环境（v6.1.0），建议使用nvm安装

### 引入项目所需模块
命令行切换到本项目根目录
安装所有项目所需的node模块（在package.json中描述），执行命令：npm i

### 开发环境
命令行切换到本项目根目录
启动开发环境，执行命令：npm run dev

### 生产环境
生成静态文件发布代码：在开发机上，执行命令：npm run build。（目标目录：./build/，完成后将代码更新至服务器）
启动生产环境：在远程服务器上，执行命令： a. 安装forever：npm i forever -g b. 运行npm run forever-prod
（首次部署）单独拷贝隐私配置文件：scp ./config/private.json root@{server_ip}:{project_path}/config/


### Bone 1.0 到 1.1 升级步骤：
1. 删掉老的`bone`目录，引入新的`.bone`目录。
2. 更换`gulpfile.js`的内容。
3. 源代码中的`router.js`，按新规则更新并重命名为`server.js`。
4. 更新`config.json`，增加`common`配置，增加`sites`配置，去除不再需要的打包相关配置。
5. 更新所有`*.server.js`的代码结构，包裹一层工厂函数。
