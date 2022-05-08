const tokenValidator = require('../services/token-validator')
const commonResponses = require('../../common/enumeration/responses')

const authentication = (httpRequest, httpResponse, next) => {
	const token = httpRequest.cookies['token']
	if (!token) {
		httpResponse.render('authentication')
		return
	}
	tokenValidator(token)
		.then(_response => {
			next()
		}).catch(error => {
			if (error.response) {
				console.log(error.response.status)
				httpResponse.render('authentication')
			} else {
				httpResponse.render('authentication', {
					message: commonResponses.SERVER_IS_NOT_RESPONDING
				})
			}
		})
}

module.exports = authentication