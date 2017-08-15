
import path from 'path'
import { exec } from 'child_process'

import {
	copy,
	ensureDirSync,
	removeSync
} from 'fs-extra'

export const createBuilder = ({
	readyToBuild,
	buildComplete
}) => {
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
				: resolve(setExecPerms(
					path.join(commonDir, 'scripts/build-app.sh'))))
	})
	const runBuildApp = buildDir => new Promise((resolve, reject) => {
		const buildScript =
			path.join(buildDir, 'common', 'scripts/build-app.sh')
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
	const tarBuild = (buildDir, filename) => new Promise((resolve, reject) => {
		const builtFilename =
			`built_${filename.substring(filename.indexOf('_') + 1)}`
		ensureDirSync('./builds')
		const args = [
			'tar',
			'czvf',
			`../builds/${builtFilename}`,
			'.'
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

	readyToBuild.subscribe(({
		buildFilename,
		postBuilt
	}) => {
		const buildDir = path.dirname(buildFilename)
		const sections = buildFilename.split('/')
		const filename = sections[sections.length - 1]
		return copyCommon(buildDir)
			.then(() => runBuildApp(buildDir))
			.then(() => tarBuild(buildDir, filename))
			.then(() => removeSync(buildDir))
			.then(() => buildComplete.next({ postBuilt }))
	})

	return Promise.resolve()
}
