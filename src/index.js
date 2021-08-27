const fs = require('fs')
const path = require('path')
// const { Compiler, compilation } = require('webpack')
const ProgressBar = require('progress')
const chalk = require('chalk')
const consola = require('consola')
const OSS = require('oss-db-node')

const readDirSync = (dir) => {
  const files = []
  function loop(childrenDir) {
    const allFiles = fs.readdirSync(childrenDir)
    allFiles.forEach((ele) => {
      const info = fs.statSync(`${childrenDir}/${ele}`)
      if (info.isDirectory()) {
        loop(`${childrenDir}/${ele}`)
      } else {
        files.push(path.join(childrenDir, ele))
      }
    })
  }
  loop(dir)
  return files
}

class OSSWebpackPlugin {
  constructor(options) {
    this.options = {
      ...this.options,
      ...options
    }
    this.failedFiles = []

    const { bucket, needCheck } = this.options

    this.oss = new OSS({
      bucket,
      needCheck
    })
  }

  options = {
    baseUrl: '/',
    bucket: 'duiba',
    maxClients: 10,
    needCheck: true,
    complete: () => {
      // noop
    }
  }

  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.done.tapAsync('OSSWebpackPlugin', (stats, callback) => {
        this.run(stats.compilation, callback)
      })
    } else {
      compiler.plugin('after-emit', (compilation, callback) => {
        this.run(compilation, callback)
      })
    }
  }

  async run(webpackCompilation, callback) {
    const { path: privatePath, publicPath } = webpackCompilation.outputOptions

    if (!fs.existsSync(privatePath)) {
      const error = new Error(`OSSWebpackPlugin\n\nDir not found: ${privatePath}`)
      webpackCompilation.errors.push(error)
      callback()
      // 发生错误强制退出
      process.exit(1)
    }

    const files = readDirSync(privatePath)

    const startTime = Date.now()
    const bar = new ProgressBar(chalk.yellow(`文件上传中 [:bar] :current/${files.length} :percent :elapsed`), {
      complete: '=',
      incomplete: '-',
      width: 20,
      total: files.length,
      callback: () => {
        consola.success(chalk.green('上传完成'))
        consola.info(
          chalk.cyan(
            `本次队列文件共${files.length}个，已存在文件${this.existFiles.length}个，上传完成文件${
              this.doneFiles.length
            }个，上传失败文件${this.failedFiles.length}个，消耗时间：${parseFloat(
              String((Date.now() - startTime) / 1000)
            )} s\n`
          )
        )
        this.options.complete()
        callback()
      }
    })

    const webpackBaseUrl = publicPath.replace(/^(https?:)?\/\/(.+?)\//, '')

    const filesGroup = []

    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      const groupIndex = parseInt(String(index / this.options.maxClients))
      if (!filesGroup[groupIndex]) {
        filesGroup[groupIndex] = []
      }
      filesGroup[groupIndex].push(file)
    }

    for (let index = 0; index < filesGroup.length; index++) {
      const files = filesGroup[index]

      try {
        await Promise.all(
          files.map((file) => {
            const name = file.replace(privatePath, '')
            const fullName = path.join('/', webpackBaseUrl || this.options.baseUrl, name)
            return new Promise((resolve, reject) => {
              this.oss
                .put({
                  path: fullName,
                  file
                })
                .then((res) => {
                  if (res.success) {
                    this.doneFiles.push(name)
                    resolve(undefined)
                    bar.tick()
                  } else if (res.message === '文件已存在') {
                    this.existFiles.push(name)
                    resolve(undefined)
                    bar.tick()
                  } else {
                    this.failedFiles.push(name)
                    reject(res)
                  }
                })
                .catch((error) => {
                  this.failedFiles.push(name)
                  reject(error)
                })
            })
          })
        )
      } catch (err) {
        const error = new Error(`OSSWebpackPlugin\n\n${err.message}`)
        webpackCompilation.errors.push(error)
        callback()
        // 发生错误强制退出
        process.exit(1)
      }
    }
  }
}

module.exports = OSSWebpackPlugin
