'use strict'

const request  = require('request-promise-native')
const request1 = require('request')
const jsdom    = require('jsdom').jsdom
const process  = require('process')
const targz    = require('tar.gz')

module.exports = function downloadPackages (count, callback) {
	console.log('downloading the', count, 'most depended npm packages')
	if (count > 36) {
		console.log("don't go higher than 36, I didn't make paging logic")
		process.exit(1)
	}
	request("https://www.npmjs.com/browse/depended").then(body => {
		const anchors = jsdom(body).querySelectorAll('.package-details h3 a')
		// this seems to hate dealing with the node list as an array. ugh
		const names = []
		for (var i = 0; i < anchors.length && i < count; ++i) {
        	names[i] = anchors[i].text
		}
		console.log(count, 'most depended packages are', names)
		return names
	}).then(names => {
		return Promise.all(names.map(name => {
			const uri = 'https://registry.npmjs.org/' + name;
			console.log('finding info for', name, 'at', uri)
			return request(uri).then(JSON.parse).then(info => {
				console.log('found info for', name)
				return {"name": name, "uri": info["versions"][info["dist-tags"]["latest"]]['dist']['tarball']}
			})
		}))
	}).then(tarballs => {
		return Promise.all(tarballs.map(tarball => {
			console.log('constructing promise for', tarball.name)
			return new Promise((resolve, reject) => {
				request1(tarball.uri)
					//.on('data', () => { console.log(tarball.uri, 'data!') })
//					.on('end', () => { console.log('end', tarball.uri); resolve(true) })
//					.on('error', (err) => { console.log('err', tarball.uri); reject(err) })
					.pipe(targz().createWriteStream('./packages/' + tarball.name))
				console.log('downloading and extracting', tarball.name, 'from', tarball.uri)
			})
		}));
	}).then(done => {
		console.log('success!')
		//callback()
	}).catch(err => {
		console.error('downloading and extraction failed', err)
		//callback()
	})

console.log('it is happening')
}
