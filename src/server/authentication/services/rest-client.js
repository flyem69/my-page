const config = require('../../../../config')
const axios = require('axios')

restClient = {
    login(email, password) {
        return axios({
            method: 'get',
            url: config.api + '/authentication/login',
            headers: {
                'Accept': 'text/plain',
                'Content-type': 'application/json'
            },
            data: {
                email: email,
                password: password
            }
        })
    },
    registration(email, name, password) {
        return axios({
            method: 'post',
            url: config.api + '/authentication/registration',
            headers: {
                'Accept': 'text/plain',
                'Content-type': 'application/json'
            },
            data: {
                email: email,
                name: name,
                password: password
            }
        })
    },
    verification(token) {
        return axios({
            method: 'get',
            url: config.api + '/authentication/verification',
            headers: {
                'Content-type': 'text/plain'
            },
            data: token
        })
    }
}

module.exports = restClient