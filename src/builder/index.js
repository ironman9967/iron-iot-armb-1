
import path from 'path'
import { exec } from 'child_process'

import {
	copy,
	ensureDirSync,
	removeSync
} from 'fs-extra'

export const createBuilder = ({
	logger,
	readyToBuild,
	buildComplete
}) => {
	const setExecPerms = file => new Promise((resolve, reject) => {
		logger.next([ 'setting exec perms', { file } ])
		exec([ 'chmod', '+x', file ].join(' '),
			(err, stdout, stderr) => {
				if (err) {
					reject(err)
				}
				else {
					resolve()
				}
			})
	})
	const copyCommon = buildDir => new Promise((resolve, reject) => {
		const from = path.join(process.env.APP_PATH, 'common')
		const to = path.join(buildDir, 'common')
		logger.next([ 'copying common', { from, to } ])
		copy(from, to, err =>
			err
				? reject(err)
				: resolve(setExecPerms(
					path.join(to, 'scripts/build-app.sh'))))
	})
	const runBuildApp = buildDir => new Promise((resolve, reject) => {
		const buildScript =
			path.join(buildDir, 'common', 'scripts/build-app.sh')
		const [
			, model,
			iteration,
			version
		] = buildDir.match(/temp-prebuild_(.*)-(.*)_app_(.*)\.tar\.gz/)
		logger.next([ 'building app', {
			buildDir,
			buildScript,
			model,
			iteration,
			version
		}])
		const args = [
			'cd',
			buildDir,
			'&&',
			buildScript,
			buildDir,
			version,
			model,
			iteration
		]
		exec(args.join(' '), { cwd: buildDir }, (err, stdout, stderr) => {
			if (err) {
				reject(err)
			}
			else {
				resolve({
					model,
					iteration,
					version
				})
			}
		})
	})
	const tarBuild = (buildDir, filename) => new Promise((resolve, reject) => {
		const builtFilename =
			`built_${filename.substring(filename.indexOf('_') + 1)}`
		const args = [
			'tar',
			'czf',
			`${process.env.APP_PATH}/dist/builds/${builtFilename}`,
			'-C',
			buildDir,
			'.',
			'--transform',
			's:[^/]*::'
		]
		logger.next([ 'taring app', {
			buildDir,
			filename,
			args
		}])
		exec(args.join(' '), (err, stdout, stderr) => {
			if (err) {
				reject(err)
			}
			else {
				resolve()
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
		logger.next(['ready to build', {
			buildFilename,
			buildDir,
			filename
		}])
		const started = new Date().getTime()
		copyCommon(buildDir)
			.then(() => runBuildApp(buildDir))
			.then(device => tarBuild(buildDir, filename)
				.then(() => device))
			.then(device => {
				removeSync(buildDir)
				return device
			})
			.then(device => ({
				build: {
					started,
					completed: new Date().getTime()
				},
				device
			}))
			.then(({ build: { started, completed }, device }) =>
				buildComplete.next({
					build: {
						started,
						completed,
						duration: completed - started
					},
					device,
					postBuilt
				})
			)
			.catch(err => logger.next(err.stack))
	})

	return Promise.resolve()
}
