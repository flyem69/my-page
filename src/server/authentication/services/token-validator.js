const restClient = require('./rest-client')

const tokenValidator = (token) => {
    return restClient.verification(token)
}

module.exports = tokenValidator