# 轻应用模板

旨在为ISV提供一个简单易上手的轻应用前端开发环境

## 开发
### 初始化

参照文档 [GuideLine](https://www.yuque.com/1688open/support/foc409#dEb8N) ，进行应用的创建和初始化后，得到appKey，

在 package.json 中，添加 appKey 和 version 字段：
 - appKey 为上一步在开放平台中申请的 appKey
 - version 为当前迭代版本号，建议从 0.0.1 开始，遵循 [semver](https://semver.org/lang/zh-CN/) 语义化版本号标准【上传包时填写的版本号要与之统一】

### 本地开发

Windows系统，建议使用 [Linux子系统](https://learn.microsoft.com/zh-cn/windows/wsl/install) 作为开发环境，

不建议使用 CMD、PowerShell 或者基于 POSIX 模拟环境的命令行（比如 git bash、cygwin等），容易出现不易排查和解决的环境问题

```bash
# 安装依赖
npm i
# 启动开发环境
npm run dev
```
线上资源需要代理到本地构建产物，请参见控制台输出信息
### 构建打包

```bash
# 构建并打包【 archive 指令前序调用了 npm run build 】 
npm run archive
```
## 一些约定

***构建发布部分，主要面向对开发构建流程有定制需求的开发者，假如你使用的是本模板的默认配置，这些大都由脚手架自动完成，无需刻意关心。***
### 构建

- 构建产物，位于 build 目录下，且只包含 js、css、json 类型的静态文件【图片和媒体资源，请上传到你自己的CDN，并在代码中引用】;
- build 目录中包含 lapp-meta.json，描述轻应用元信息【配置结构及含义，详参模板根目录的同名文件】;
- 构建完成后，剔除 node_modules 依赖等冗余文件后，将整个目录打包为 zip 格式【build 路径以外的内容，不会上公网CDN，主要是便于平台侧技术人员还原现场，共同排查问题】;

### 发布

- 开放平台入端插件管理界面中，上传zip压缩包后，会校验 build 路径产物，并上传到 CDN 上;
- CDN为非覆盖式发布，会根据你的 appKey 和 version ，以及 build 目录文件结构，组装产物地址【详参 vite.config.ts 中的 base 字段】;

### 运行

- 运行时容器，会根据 appKey 和 version 拉取静态资源【version不存在则根据appKey拉最新版本】，如果能拉到合法 lapp-meta.json ，则会走轻应用加载逻辑;
- 轻应用加载时，会加载 index.js 以及 index.css 到容器中，其中 js scriptType 由 lapp-meta.json 定义;
- index.js 需要自初始化，将 DOM 渲染到 id 为 root 的 div 节点中，需要自己处理分包的加载;
- 容器内无法访问 cookie 对象，且对 fetch 和 XMLHttpRequest 做了限制; 除 1688 域内的白名单外，其余请求需通过 window.bridge 进行调用

```javascript
// 直接调用开放平台的API，内部包含5个参数 {version, namespace, name, appkey, data}
// https://open.1688.com/api/apidocdetail.htm?id=com.alibaba.product:alibaba.product.get-1&aopApiCategory=product_new
window.bridge.call('open.api.request', {
    version: '1',
    namespace: 'com.alibaba.product',
    name: 'alibaba.product.get',
    data: {
        productID: 54321,
        webSite: '1688'
    }
}, (res) => {
    console.log(res);
});

// 通过开放平台网关调用isv自己服务器的API，
// 需要在应用管理界面，提前配置好代理通道，详参上文中的 语雀 GuideLine
// 参数基本同 fetch，body 无需 stringify，用户信息会在 http header 中自动附加，用 userId 字段标识
window.bridge.call('open.api.proxy', {
    url: 'http://gw.open.1688.com/openapi/param2/1/system/currentTime/1323',
    method: 'GET',
    // headers: {},
    // body: {}
}, (res) => {
    console.log(res);
});

// 轻应用场景下，监听上层应用传来的消息，返回 Promise，这里只示例解析消息及处理的流程
// 消息体入参中的 actionType 和 actionBody 格式，以及返回体出参中的 data 格式，
// 模拟调试方法等，请参见 jumpFunction 的说明文档：https://www.yuque.com/1688open/support/xkezpe9wof04gsk8
window.bridge.call('open.api.lapp.listen', {}, (message) => {
    // message 为每个轻应用场景约定的消息体
    const { actionType, actionBody } = message;
    // actionType 为每个轻应用场景约定的消息类型，actionBody 为该消息类型对应入参
    return new Promise((rs) => {
        // 处理自己的业务逻辑
        const result = (Math.floor(Math.random() * 2) == 0); // 这里抛个硬币，模拟业务成功失败
        // 无论成功失败都走resolve，不走reject逻辑
        if (result === true) {
            // 业务成功
            rs({
                // 表示业务成功，此时上层应取data字段进行进一步处理，比如回填或者提交
                success: true,
                // 业务数据
                data: {},
                /************************* 以下是业务成功可选项目 *************************/
                // 返回码
                retCode: 'SUCCESS',
                // 返回信息
                retMessage: '处理成功',
                // 追溯信息，由ISV自定义的 traceId 等等，便于排查问题
                traceInfo: {}
            });
        } else {
            // 业务失败
            rs({
                // 表示业务失败，此时上层应取 retMessage 字段展示给用户
                success: false,
                // 返回码
                retCode: 'FAILURE',
                // 返回信息
                retMessage: '处理失败',
                // 追溯信息，由ISV自定义的 traceId 等等，便于排查问题
                traceInfo: {},
                /************************* 以下是业务失败可选项目 *************************/
                // 业务数据
                data: {}
            });
        }
    });
});

```

## MISC

- [1688open 语雀支持文档](https://www.yuque.com/1688open/support)
- “1688PC入端-ISV技术服务” 钉钉群号： 21738069 ，
  - 入群申请请备注 “公司 - 职位” ，空备注会被当做推广拒绝
  - 提问前请先参照上面的支持文档，并善用搜索
  - 提问时请提供 appKey、version、涉及账号以及环境信息，以资参考
