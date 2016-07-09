'use strict'

const Writable = require('readable-stream/writable')
const inherits = require('util').inherits
const pump = require('pump')
const zlib = require('zlib')
const tar = require('tar-fs')
const fs = require('fs')
const path = require('path')
const get = require('./get')

module.exports = DownloadStream

function DownloadStream (destination) {
  if (!(this instanceof DownloadStream)) return new DownloadStream(destination)
  this.destination = destination
  Writable.call(this, {
    objectMode: true
  })
}

inherits(DownloadStream, Writable)

DownloadStream.prototype._write = function (chunk, encoding, callback) {
  const target = path.resolve(this.destination, chunk.name)
  fs.mkdir(target, function (err) {
    if (err) return callback(err)
    pump(
      get({url: chunk.url}),
      zlib.createGunzip(),
      tar.extract(target, {strip: 1}),
      callback
    )
  })
}
