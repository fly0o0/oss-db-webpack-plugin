const path = require('path')

const OSSWebpackPlugin = require('../src')

const config = {
  entry: path.join(__dirname, './index.js'),
  mode: 'production',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, './dist'),
    publicPath: '//yun.duiba.com.cn/oss-webpack-plugin'
  },
  plugins: [new OSSWebpackPlugin()]
}

module.exports = config
