
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
import { routeApi } from './http-server/api'

const port = 9978

const logger = new Subject()
const downloadPrebuild = new Subject()
const readyToBuild = new Subject()
const buildComplete = new Subject()

emptyDirSync('./builds')

createBuildPoster({ logger, buildComplete })
	.then(() => createBuilder({ logger, readyToBuild, buildComplete }))
	.then(() => createHttpServer({ port, logger, downloadPrebuild }))
	.then(server => {
		logger.subscribe(arg => {
			const { message, data } =
				typeof arg == 'string' ? { message: arg } : arg
			server.log(message, data)
		})
		return server
	})
	.then(server => routeApi({ server, logger, downloadPrebuild }))
	.then(server => server.start(err => {
		if (err) {
			throw err
		}
		else {
			logger.next(`server up on ${port}`)
			createPrebuildDownloader({ logger, downloadPrebuild, readyToBuild })
				.then(({ downloadPrebuildList }) => downloadPrebuildList())
				.then(prebuildList => {
					if (prebuildList.length == 0) {
						logger.next('cloud has no prebuilds ready')
					}
					return prebuildList
				})
				.then(
					each(({ getPrebuild, postBuilt }) =>
						downloadPrebuild.next({
							getPrebuild: getPrebuild.substring(1),
							postBuilt: postBuilt.substring(1)
						}))
				)
		}
	}))
