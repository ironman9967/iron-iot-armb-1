
import path from 'path'
import {
	createReadStream,
	removeSync
} from 'fs-extra'

import request from 'request'

export const createBuildPoster = ({ logger, buildComplete }) => {
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
		})).form().append(filename, createReadStream(buildFilename))
		
		// createReadStream(buildFilename)
		// 	.pipe(request({
		// 		method: 'POST',
		// 		uri: `${process.env.CLOUD_URI}/${postBuilt}`,
		// 		headers: {
		// 			'Content-Type': 'application/octet-stream'
		// 		},
    	// 		resolveWithFullResponse: true
		// 	}, ((err, res) => {
		// 		if (err) {
		// 			throw err
		// 		}
		// 		else if (res.statusCode != 201) {
		// 			throw new Error(`build failed to post: ${postBuilt}`)
		// 		}
		// 	})))
	})
	return Promise.resolve()
}
