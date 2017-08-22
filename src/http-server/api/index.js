
import { createPrebuildReadyApi } from './prebuild-ready'

export const routeApi = ({
	server,
	logger,
	downloadPrebuild
}) => {
	const { createRoute: prebuildReadyRoute } = createPrebuildReadyApi({
		logger,
		downloadPrebuild
	})
	server.route(prebuildReadyRoute())

	return server
}
