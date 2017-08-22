
export const createPrebuildReadyApi = ({
	logger,
	downloadPrebuild
}) => {
	const apiRoute = 'api/prebuild-ready'

	return {
		createRoute: () => ({
			method: 'POST',
			path: `/${apiRoute}`,
			config: {
				payload: {
					parse: true
				}
			},
			handler: ({
				payload: {
					getPrebuild,
					postBuilt
				}
			}, reply) => {
				logger.next({
					message: 'prebuild ready',
					data: {
						getPrebuild,
						postBuilt
					}
				})
				downloadPrebuild.next({
					getPrebuild: getPrebuild.substring(1),
					postBuilt: postBuilt.substring(1)
				})
				reply()
			}
		})
	}
}
