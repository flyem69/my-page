const restClient = require('./rest')

const tokenValidator = (token) => {
    return restClient.verification(token)
}

module.exports = tokenValidator