
import path from 'path'
import { exec } from 'child_process'

import {
	emptyDirSync,
	createWriteStream,
	removeSync
} from 'fs-extra'

import each from 'lodash/fp/each'
import request from 'request'
import rp from 'request-promise'

const build = buildFilename =>
	new Promise((resolve, reject) => {
		const buildDir = path.dirname(buildFilename)
		const [
			, model,
			iteration,
			version
		] = buildDir.match(/build-prebuild_(.*)-(.*)_app_(.*)\.tar\.gz/)
		const args = [
			'cd',
			buildDir,
			'&&',
			'sh',
			path.resolve('./common/scripts/build-app.sh'),
			version,
			model,
			iteration
		]
		exec(args.join(' '), (err, stdout, stderr) => {

			console.log(err)
			console.log(stdout)
			console.log(stderr)

		// 	if (err) {
		// 		err.stderr = stderr
		// 		reject(err)
		// 	}
		// 	else {
		// 		fsStat(path.join(prebuildFolder, `prebuild_${getTarSuffix(d, 'app')}`))
		// 			.then(() => resolve({
		// 				device: d,
		// 				stdout,
		// 				stderr
		// 			}))
		// 			.catch(() => {
		// 				const err = new Error(`${getModelItrStr(d)} prebuild failed to download`)
		// 				err.device = d
		// 				err.getAppStdout = stdout
		// 				err.getAppStderr = stderr
		// 				console.log(err)
		// 				reject(err)
		// 			})
		// 	}
		})
	})

rp({
	uri: `${process.env.CLOUD_URI}/api/bin/devices/prebuilds`,
	headers: { 'User-Agent': 'iron-iot-armb-1' },
	json: true
})
	.then(
		each(route => {
			const sections = route.split('/')
			const filename = sections[sections.length - 1]
			const buildDir = `./build-${filename}`
			const buildFilename = path.resolve(path.join(buildDir, filename))
			emptyDirSync(buildDir)
			const uri = `${process.env.CLOUD_URI}${route}`
			request({ uri, headers: { 'User-Agent': 'iron-iot-armb-1' } })
				.pipe(createWriteStream(buildFilename))

			build(buildFilename)//.then(() => removeSync(buildDir))
		})
	)
