const express = require('express')
const apiAuthentication = require('../../authentication/middleware/api-authentication')
const streamsService = require('./streams')

const router = express.Router()

router.get('/api/streams', apiAuthentication, (_httpRequest, httpResponse) => {
    httpResponse.json(streamsService.getAll())
})

module.exports = router