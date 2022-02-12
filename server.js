const config = require('./config')
const https = require('https')
const express = require('express')
const serveStatic = require('serve-static')
const fs = require('fs')
const { Server } = require("socket.io")
const { ExpressPeerServer } = require('peer')
const restClient = require('./rest')

const expressApp = express()
const httpServer = https.createServer({
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/certificate.pem')
}, expressApp)
const socketServer = new Server(httpServer, {
    path: '/socket'
})
const peerServer = ExpressPeerServer(httpServer, {
    path: '/peer',
    port: config.port,
    ssl: {
        key: fs.readFileSync('ssl/key.pem'),
        cert: fs.readFileSync('ssl/certificate.pem')
    }
})
const streamSockets = new Set()

expressApp.set('view engine', 'ejs')

expressApp.use(serveStatic(__dirname + '/static/react-content', { index: false }))
expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: false }))
expressApp.use(peerServer)

expressApp.get('/api/streams', (req, res) => {
    res.json(Array.from(streamSockets))
})

expressApp.post('/login', (httpRequest, httpResponse) => {
    restClient.authentication.login(httpRequest.body.emailOrName, httpRequest.body.password)
        .then(apiResponse => {
            console.log(apiResponse.data)
        }).catch(apiError => {
            if (apiError.response) {
                switch(apiError.response.status) {
                    case 400:
                        console.log(apiError.response.data)
                        break
                    case 401:
                        console.log('Wrong email/username or password')
                        break
                    default:
                        console.log('Something went wrong')
                }
            } else {
                console.log('Server is not responding')
            }
        })
    httpResponse.render('./authentication/index.ejs', { config: config })
})

expressApp.post('/registration', (httpRequest, httpResponse) => {
    restClient.authentication.registration(httpRequest.body.email, httpRequest.body.name, httpRequest.body.password)
        .then(apiResponse => {
            console.log('registration succeeded')
        }).catch(apiError => {
            if (apiError.response) {
                if (apiError.response.status == 400) {
                    console.log(apiError.response.data)
                } else {
                    console.log('Something went wrong')
                }
            } else {
                console.log('Server is not responding')
            }
        })
    httpResponse.render('./authentication/index.ejs', { config: config })
})

expressApp.get('/*', (httpRequest, httpResponse, next) => {
    const bearerHeader = httpRequest.headers['authorization']
    if (bearerHeader) {
        next()
    } else {
        httpResponse.render('./authentication/index.ejs', { config: config })
    }
}, (httpRequest, httpResponse) => {
    httpResponse.sendFile(__dirname + '/static/react-content/index.html')
})

socketServer.on('connection', (socket) => {
    socket.on('disconnect', () => {
        streamSockets.delete(socket.id)
    })
    socket.on('joinStream', (streamSocket, userId) => {
        if (socket.id !== streamSocket) {
            socket.join(streamSocket)
        }
        socket.to(streamSocket).emit('viewerJoining', userId)
    })
    socket.on('leaveStream', (streamSocket, userId) => {
        socket.to(streamSocket).emit('viewerLeaving', userId)
        if (socket.id !== streamSocket) {
            socket.leave(streamSocket)
        }
    })
    socket.on('registerStream', () => {
        streamSockets.add(socket.id)
    })
    socket.on('deregisterStream', () => {
        streamSockets.delete(socket.id)
    })
})

httpServer.listen(config.port, () => {
    console.log(`listening on ${config.port}`)
})
