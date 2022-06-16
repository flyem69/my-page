const tokenValidator = require('../services/token-validator')

const apiAuthentication = (httpRequest, httpResponse, next) => {
    const token = httpRequest.cookies['token']
	if (!token) {
		httpResponse.sendStatus(401)
		return
	}
	tokenValidator(token)
		.then(_response => {
			next()
		}).catch(error => {
			if (error.response) {
				httpResponse.status(error.response.status).send(error.response.data)
			} else {
				httpResponse.sendStatus(503)
			}
		})
}

module.exports = apiAuthentication