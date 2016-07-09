'use strict'

const through = require('through2')
const join = require('url-join')
const JSONStream = require('JSONStream')
const pump = require('pump')
const get = require('./get')
const REGISTRY = 'https://registry.npmjs.org'

module.exports = latest

function latest () {
  return through.obj(function (pkg, enc, callback) {
    pkg = String(pkg).trim()
    const url = join(REGISTRY, pkg)

    pump(
      get({url: url}),
      JSONStream.parse('dist-tags.latest').once('data', flush),
      function (err) {
        if (err) callback(err)
      }
    )

    function flush (version) {
      callback(null, {
        name: pkg,
        url: join(REGISTRY, pkg, '-', pkg + '-' + version + '.tgz')
      })
    }
  })
}
