const express = require('express')
const authentication = require('../../authentication/middleware/authentication')
const streamsService = require('./streams')

const router = express.Router()

router.get('/api/streams', authentication, (_httpRequest, httpResponse) => {
    httpResponse.json(streamsService.get())
})

module.exports = router