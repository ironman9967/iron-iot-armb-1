
import each from 'lodash/fp/each'
import rp from 'request-promise'

rp({
	uri: `${process.env.CLOUD_URI}/api/bin/downloader/prebuild`,
	headers: { 'User-Agent': 'iron-iot-armb-1' },
	json: true
})
	.then(console.log)

	// .then(each(prebuild => getFromCloud(prebuild)))
