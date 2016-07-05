## 环境搭建指南

### 搭建NodeJS环境
安装NodeJS环境（v4.4.2），建议使用nvm安装
安装cnpm，替代npm（cnpm速度快，且支持私库）

### 引入项目所需模块
命令行切换到本项目根目录
安装所有项目所需的node模块（在package.json中描述），执行命令：cnpm install

### 开发环境
命令行切换到本项目根目录
启动开发环境，执行命令：gulp serve

### 生产环境
生成静态文件发布代码：在开发机上，执行命令：gulp。（目标目录：./build/，完成后将代码更新至服务器）
启动生产环境：在远程服务器上，执行命令： a. 安装forever：cnpm install forever -g b. 运行npm run prod-start
（首次部署）单独拷贝隐私配置文件：scp ./config/private.js root@{server_ip}:/var/app/{project_folder}/config/
