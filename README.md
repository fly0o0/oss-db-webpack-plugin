# OSS-Webpack-Plugin

阿里云 OSS 上传工具 Webpack 插件

## 安装

```bash
yarn add oss-webpack-plugin -D
```

```bash
npm install oss-webpack-plugin -D
```

## 使用

```js
const path = require('path')

// ES
import OSSWebpackPlugin from 'oss-webpack-plugin'

// JS
const OSSWebpackPlugin = require('oss-webpack-plugin').default

module.exports = {
  output: {
    path: path.join(__dirname, './dist'),
    publicPath: '/oss-webpack-plugin'
  },
  plugins: [new OSSWebpackPlugin()]
}
```

## 参数

### baseUrl

Type: `string` Default: `output.publicPath`

基础路径，默认为 webpack 配置中的 output.publicPath

### bucket

Type: `string` Default: `duiba`

OSS 实例

### maxClients

Type: `number` Default: `10`

最大上传并发数

### complete

Type: `function` Default: `-`

上传完成回调函数
