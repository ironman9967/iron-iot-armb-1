
import path from 'path'

import {
	emptyDirSync,
	createWriteStream
} from 'fs-extra'
import request from 'request'
import rp from 'request-promise'

export const createPrebuildDownloader = ({ downloadPrebuild, readyToBuild }) => {
	downloadPrebuild.subscribe(({
		getPrebuild,
		postBuilt
	}) => {
		const sections = getPrebuild.split('/')
		const filename = sections[sections.length - 1]
		const buildDir = `./temp-${filename}`
		const buildFilename = path.resolve(path.join(buildDir, filename))
		const uri = `${process.env.CLOUD_URI}/${getPrebuild}`
		emptyDirSync(buildDir)
		request({ uri, headers: { 'User-Agent': 'iron-iot-armb-1' } })
			.pipe(createWriteStream(buildFilename))
		readyToBuild.next({
			buildFilename,
			postBuilt
		})
	})

	return Promise.resolve({
		downloadPrebuildList: () => rp({
			uri: `${process.env.CLOUD_URI}/api/bin/devices/prebuilds`,
			headers: { 'User-Agent': 'iron-iot-armb-1' },
			json: true
		})
	})
}
