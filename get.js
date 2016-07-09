'use strict'

const PassThrough = require('readable-stream/passthrough')
const get = require('simple-get')

module.exports = getStream

function getStream (options) {
  const stream = new PassThrough()
  get(options, function (err, res) {
    if (err) return stream.emit('err')
    res.pipe(stream)
  })
  return stream
}
