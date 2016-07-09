'use strict'

const assert = require('assert')
const join = require('url-join')
const get = require('./get')
const JSONStream = require('JSONStream')
const qs = require('querystring')
const sort = require('sort-stream')
const take = require('take-stream')
const es = require('event-stream')

const REGISTRY = 'https://skimdb.npmjs.com/registry'
const VIEWS = '/_design/scratch/_view'
const DEPENDED_UPON = '/dependedUpon'

module.exports = depended

function depended (count) {
  assert(typeof count, 'number', 'package count required')

  const options = {
    url: join(REGISTRY, VIEWS, DEPENDED_UPON) + '?' + qs.stringify({
      group_level: 1
    })
  }

  return get(options)
    .pipe(JSONStream.parse('rows.*'))
    .pipe(es.mapSync((data) => ({
      name: data.key[0],
      dependents: data.value
    })))
    .pipe(sort((a, b) => b.dependents - a.dependents))
    .pipe(take(count))
    .pipe(es.mapSync((data) => data.name))
}
