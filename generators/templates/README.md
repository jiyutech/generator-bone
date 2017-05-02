## 环境搭建指南


### 搭建NodeJS环境
安装NodeJS环境（使用`package.json`中声明的版本号），建议使用nvm安装


### 引入项目所需模块
命令行切换到本项目根目录
执行命令：npm install，安装所有项目所需的node模块（在package.json中描述）


### 开发环境
命令行切换到本项目根目录
执行命令：npm run dev，启动开发环境


### 生产环境
生成静态文件发布代码：在开发机上，执行命令：npm run build。（目标目录：./build/，完成后将代码更新至服务器）
启动生产环境：在远程服务器上，执行命令： a. 安装forever：npm i forever -g b. 运行npm run forever-prod
（首次部署）单独拷贝隐私配置文件：scp ./config/private.json root@{server_ip}:{project_path}/config/


### 注意事项
6. 使用`c.request`发送请求时，若为JSON返回值，必须增加`{ json: true }`设置
7. 配置管理方法：`config/config.json`里的`dev`、`prod`、`test`配置的是每个运行环境下的特有配置，`common`则是公共配置。环境配置会覆盖公共配置中的同名配置项。`config/addon.json`里的配置会覆写当前运行环境下的同名配置项。


### Bone 1.0 到 1.2 升级步骤：
1. 删掉老的`bone`目录，引入新的`.bone`目录。
2. 更换`gulpfile.js`的内容。
3. 源代码中的`router.js`，按新规则更新并重命名为`server.js`。
4. 更新`config.json`，增加`common`配置，增加`sites`配置，去除不再需要的打包相关配置。
5. 更新所有`*.server.js`的代码结构，包裹一层工厂函数。
6. 服务端代码（`server`目录下，或`*.server.js`文件）不可再依赖`.bone`目录中的代码，替代方案见工厂函数的传入参数说明。
