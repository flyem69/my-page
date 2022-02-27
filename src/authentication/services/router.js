const config = require('../../../config')
const express = require('express')
const restClient = require('../services/rest')
const commonResponses = require('../../common/enumeration/responses')

const router = express.Router()

router.post('/login', (httpRequest, httpResponse) => {
    restClient.login(httpRequest.body.emailOrName, httpRequest.body.password)
        .then(response => {
            httpResponse.sendFile(config.root + '/static/react-content/index.html', {
                headers: {
                    'set-cookie': 'token=' + response.data
                }
            })
        }).catch(error => {
            let message
            if (error.response) {
                if (error.response.status === 400) {
                    message = error.response.data
                } else {
                    message = commonResponses.SOMETHING_WENT_WRONG
                }
            } else {
                message = commonResponses.SERVER_IS_NOT_RESPONDING
            }
            httpResponse.render('authentication', {
                message: message
            })
        })
})

router.post('/registration', (httpRequest, httpResponse) => {
    restClient.registration(httpRequest.body.email, httpRequest.body.name, httpRequest.body.password)
        .then(response => {
            httpResponse.sendFile(config.root + '/static/react-content/index.html', {
                headers: {
                    'set-cookie': 'token=' + response.data
                }
            })
        }).catch(error => {
            let message
            if (error.response) {
                if (error.response.status === 400) {
                    message = error.response.data
                } else {
                    message = commonResponses.SOMETHING_WENT_WRONG
                }
            } else {
                message = commonResponses.SERVER_IS_NOT_RESPONDING
            }
            console.log(message)
            httpResponse.render('authentication', {
                message: message
            })
        })
})

module.exports = router