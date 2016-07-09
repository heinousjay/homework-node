'use strict'

const test = require('tape')
const series = require('run-series')
const fs = require('fs')
const folderSize = require('get-folder-size')
const download = require('./')

test('download', function (t) {
  t.plan(3)

  const COUNT = process.env.COUNT || 10

  series([
    (callback) => download(COUNT, callback),
    verifyCount,
    verifySize,
    verifyLodash
  ], t.end)

  function verifyCount (callback) {
    fs.readdir('./packages', function (err, files) {
      if (err) return callback(err)
      // Filter .gitignore and other hidden files
      files = files.filter((file) => !/^\./.test(file))
      t.equal(files.length, COUNT, `has ${COUNT} files`)
      callback()
    })
  }

  function verifySize (callback) {
    folderSize('./packages', function (err, size) {
      if (err) return callback(err)
      const Mb = (size / 1024 / 1024).toFixed(2)
      const expected = COUNT / 2
      t.ok(Mb > expected * 0.75 && Mb < expected * 1.25, 'size is within 25% of expected')
    })
  }

  function verifyLodash (callback) {
    const _ = require('./packages/lodash')
    t.equal(typeof _.map, 'function', '_.map exists')
    callback()
  }
})
