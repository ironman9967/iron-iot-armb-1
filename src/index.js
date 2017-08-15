
import path from 'path'

import {
	emptyDirSync,
	createWriteStream
} from 'fs-extra'
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject'
import request from 'request'
import each from 'lodash/fp/each'
import rp from 'request-promise'

import { createPrebuildDownloader } from './prebuild-downloader'
import { createBuilder } from './builder'
import { createBuildPoster } from './build-poster'
import { createHttpServer } from './http-server'

const port = 9978

const downloadPrebuild = new Subject()
const readyToBuild = new Subject()
const buildComplete = new Subject()

emptyDirSync('./builds')

createBuildPoster({ buildComplete })
	.then(() => createBuilder({ readyToBuild, buildComplete }))
	.then(() => createHttpServer({ port, downloadPrebuild }))
	.then(server => server.start(err => {
		if (err) {
			throw err
		}
		else {
			console.log(`server up on ${port}`)
			createPrebuildDownloader({ downloadPrebuild, readyToBuild })
				.then(({ downloadPrebuildList }) => downloadPrebuildList())
				.then(
					each(({ getPrebuild, postBuilt }) =>
						downloadPrebuild.next({
							getPrebuild: getPrebuild.substring(1),
							postBuilt: postBuilt.substring(1)
						}))
				)
		}
	}))
