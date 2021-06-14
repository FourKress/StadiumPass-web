## 开发环境

yarn
使用终端或者 cmd 安装 yarn[安装 | Yarn 中文文档](https://yarn.bootcss.com/docs/install/#mac-stable)

进入项目根目录，执行如下命令安装依赖包：

```sh
yarn
```

## 开始开发

小程序调试模式

```sh
yarn dev:weapp
```

构建小程序发布文件

```sh
yarn build:weapp
```

##**目录结构**

##**PS**

1.  如果出现 node-saas 导致安装失败，可以将 yarn 源切换到淘宝的再试试 `yarn config set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass -g`

### 提交日志规范

feat：新功能（feature）
fix：修补 bug
docs：文档（documentation）
style： 格式（不影响代码运行的变动）
refactor：重构（即不是新增功能，也不是修改 bug 的代码变动）
test：增加测试
chore：构建过程或辅助工具的变动
