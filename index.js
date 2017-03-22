'use strict'

const request = require('request-promise-native')
const jsdom   = require('jsdom').jsdom
const process = require('process')
const dlTar   = require('dl-tgz')

module.exports = function downloadPackages (count, callback) {
	console.log('downloading the', count, 'most depended npm packages')
	// i guess my thirst for bonus points has a limit
	if (count > 36) {
		console.log("don't go higher than 36, I didn't make paging logic")
		process.exit(1)
	}
	request("https://www.npmjs.com/browse/depended").then(body => {
		const anchors = jsdom(body).querySelectorAll('.package-details h3 a')
		// this seems to hate dealing with the node list as an array. ugh
		// i suspect it is an actual object with numeric keys and a manual
		// length property. Array.prototype.map failed
		const names = []
		for (var i = 0; i < anchors.length && i < count; ++i) {
        	names[i] = anchors[i].text
		}
		console.log(count, 'most depended packages are', names)
		return names
	}).then(names => {
		return Promise.all(names.map(name => {
			const uri = 'https://registry.npmjs.org/' + name
			console.log('finding info for', name, 'at', uri)
			return request(uri).then(JSON.parse).then(info => {
				console.log('found info for', name)
				// dig into the JSON to get the latest tarball
				return {
					name, 
					uri: info["versions"][info["dist-tags"]["latest"]]['dist']['tarball']
				}
			})
		}))
	}).then(tarballs => {
		return Promise.all(tarballs.map(tarball => {
			return new Promise((resolve, reject) => {
				// observable convert to promise fun wheee
				// this dl-tgz library was the most successful lib i found
				// so this is a minor hurdle
				dlTar(tarball.uri, './packages/' + tarball.name).subscribe({
					complete() {
						console.log(tarball.name, 'complete')
						resolve(true)
					},
					error(err) {
						console.log(tarball.name, 'error')
						reject(err)
					}
				})
				console.log('downloading and extracting', tarball.name, 'from', tarball.uri)
			})
		}))
	}).then(done => {
		console.log('success!')
		callback()
	}).catch(err => {
		console.error('downloading and extraction failed, the tests will as well', err)
		callback()
	})
}
