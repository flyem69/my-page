const restClient = require('../../authentication/services/rest')
const commonResponses = require('../enumeration/responses')

const tokenValidator = (httpRequest, httpResponse, next) => {
    const token = httpRequest.cookies['token']
    if (token) {
        restClient.verification(token)
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
    } else {
        httpResponse.render('authentication')
    }
}

module.exports = tokenValidator