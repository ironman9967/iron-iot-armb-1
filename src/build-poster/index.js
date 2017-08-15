
import path from 'path'
import {
	createReadStream,
	removeSync
} from 'fs'

import request from 'request'

export const createBuildPoster = ({ buildComplete }) => {
	buildComplete.subscribe(({ postBuilt }) => {
		const sections = postBuilt.split('/')
		const buildFilename = path.resolve(`./builds/${sections[sections.length - 1]}`)
		fs.createReadStream(buildFilename)
			.pipe(request({
				method: 'POST',
				uri: `${process.env.CLOUD_URI}/${postBuilt}`,
    			resolveWithFullResponse: true
			}).then(({ statusCode }) => {
				if (statusCode != 201) {
					throw new Error(`post built failed: ${statusCode} - ${postBuilt}`)
				}
			}))
	})
	return Promise.resolve()
}
