const config = require('./config')
const axios = require('axios')

function postToApi(pathName, data) {
    return axios({
        method: 'post',
        url: config.myPageApiOrigin + pathName,
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        data: data
    })
}

function getFromApi(pathName) {
    return axios({
        method: 'get',
        url: config.myPageApiOrigin + pathName,
        headers: {
            'Accept': 'application/json'
        }
    })
}

restClient = {
    authentication: {
        login(emailOrName, password) {
            return postToApi('/login', {
                emailOrName: emailOrName,
                password: password
            })
        },
        registration(email, name, password) {
            return postToApi('/registration', {
                email: email,
                name: name,
                password, password
            })
        }
    },
    streams: {

    }
}

module.exports = restClient