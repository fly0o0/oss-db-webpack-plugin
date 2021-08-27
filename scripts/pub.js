#!/usr/bin/env node

const { execSync } = require('child_process')
const consola = require('consola')

const pkg = require('../package.json')

if (!pkg.version.match(/^\d+\.\d+\.\d+(-(beta|alpha|rc)\.\d+)?$/)) {
  consola.error(new Error('版本号不符合规范'))
  return
}

// auto npm tag
let tag = pkg.version.match(/-(.+)\./)
if (tag) {
  tag = tag[1]
}

if (tag) {
  execSync(`npm publish --access-public --tag=${tag}`)
} else {
  execSync('npm publish --access-public')
}
