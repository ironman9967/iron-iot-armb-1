
import path from 'path'
import {
	createReadStream,
	removeSync
} from 'fs-extra'

import request from 'request'

export const createBuildPoster = ({
	logger,
	buildComplete,
	selfUpdateReady
}) => {

	logger.next('debug', {
		x: path.resolve('./builds')
	})

	buildComplete.subscribe(({ postBuilt }) => {
		const sections = postBuilt.split('/')
		const filename = sections[sections.length - 1]
		const buildFilename = path.resolve(`./builds/${filename}`)
		logger.next({
			message: 'posting build',
			data: {
				buildFilename,
				postBuilt
			}
		})
		request({
			method: 'POST',
			uri: `${process.env.CLOUD_URI}/${postBuilt}`,
			resolveWithFullResponse: true
		}, ((err, res) => {
			if (err) {
				throw err
			}
			else if (res.statusCode != 201) {
				throw new Error(`build failed to post: ${postBuilt}`)
			}
			removeSync(buildFilename)
			if (buildFilename.indexOf('armb-1') > -1) {
				selfUpdateReady.next()
			}
		})).form().append(filename, createReadStream(buildFilename))
	})
	return Promise.resolve()
}
