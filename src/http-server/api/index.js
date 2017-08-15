
import { createPrebuildReadyApi } from './prebuild-ready'

export const routeApi = (server, {
	downloadPrebuild
}) => {
	const { createRoute: prebuildReadyRoute } = createPrebuildReadyApi({
		downloadPrebuild
	})
	server.route(prebuildReadyRoute())

	return server
}
