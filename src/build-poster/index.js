
import path from 'path'
import {
	createReadStream,
	removeSync
} from 'fs-extra'

import request from 'request'

export const createBuildPoster = ({ buildComplete }) => {
	buildComplete.subscribe(({ postBuilt }) => {
		const sections = postBuilt.split('/')
		const buildFilename = path.resolve(`./builds/${sections[sections.length - 1]}`)
		createReadStream(buildFilename)
			.pipe(request({
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
			})))
	})
	return Promise.resolve()
}
