
import path from 'path'
import { copy } from 'fs-extra'
import { exec } from 'child_process'

import {
	emptyDirSync,
	createWriteStream,
	removeSync
} from 'fs-extra'

import each from 'lodash/fp/each'
import request from 'request'
import rp from 'request-promise'

const setExecPerms = file => new Promise((resolve, reject) => {
	exec([ 'chmod', '+x', file ].join(' '),
		(err, stdout, stderr) => {
			if (err) {
				err.stdout = stdout
				err.stderr = stderr
				reject(err)
			}
			else {
				resolve()
			}
		})
})
const copyCommon = buildDir => new Promise((resolve, reject) => {
	const commonDir = path.join(buildDir, 'common')
	copy('./common', commonDir, err =>
		err
			? reject(err)
			: resolve(setExecPerms(path.join(commonDir, 'scripts/build-app.sh'))))
})
const runBuildApp = buildDir => new Promise((resolve, reject) => {
	const buildScript = path.join(buildDir, 'common', 'scripts/build-app.sh')
	const [
		, model,
		iteration,
		version
	] = buildDir.match(/temp-prebuild_(.*)-(.*)_app_(.*)\.tar\.gz/)
	const args = [
		'cd',
		buildDir,
		'&&',
		buildScript,
		version,
		model,
		iteration
	]
	exec(args.join(' '), { cwd: buildDir }, (err, stdout, stderr) => {
		if (err) {
			err.stdout = stdout
			err.stderr = stderr
			reject(err)
		}
		else {
			resolve({
				stdout,
				stderr
			})
		}
	})
})

const build = buildFilename => {
	const buildDir = path.dirname(buildFilename)
	return copyCommon(buildDir)
		.then(() => runBuildApp(buildDir))
}

rp({
	uri: `${process.env.CLOUD_URI}/api/bin/devices/prebuilds`,
	headers: { 'User-Agent': 'iron-iot-armb-1' },
	json: true
})
	.then(
		each(route => {
			const sections = route.split('/')
			const filename = sections[sections.length - 1]
			const buildDir = `./temp-${filename}`
			const buildFilename = path.resolve(path.join(buildDir, filename))
			emptyDirSync(buildDir)
			const uri = `${process.env.CLOUD_URI}${route}`
			request({ uri, headers: { 'User-Agent': 'iron-iot-armb-1' } })
				.pipe(createWriteStream(buildFilename))

			build(buildFilename)//.then(() => removeSync(buildDir))
		})
	)
