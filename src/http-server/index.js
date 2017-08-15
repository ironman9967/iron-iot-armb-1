
import path from 'path'

import { Server } from 'hapi'
import Good from 'good'

export const createHttpServer = ({ port, downloadPrebuild }) => {
	const server = new Server()
	server.connection({ port })
	server.route({
		method: 'POST',
		path: '/api/prebuild/{postBuilt*}',
		handler: ({ params: { postBuilt }}, reply) => {
			console.log('postBuilt', postBuilt.split('/'))
			// downloadPrebuild.next({ prebuildDlRoute })
			reply()
		}
	})
	return server.register({
		register: Good,
		options: {
			reporters: {
				consoleReporter: [{
					module: 'good-squeeze',
					name: 'Squeeze',
					args: [{
						log: '*',
						response: '*'
					}]
				}, {
					module: 'good-console'
				}, 'stdout']
			}
		}
	}).then(() => server)
}
