'use strict'

const pump = require('pump')
const depended = require('./depended')
const latest = require('./latest')
const download = require('./download')

module.exports = downloadPackages

function downloadPackages (count, callback) {
  pump(depended(count), latest(), download('./packages'), callback)
}
