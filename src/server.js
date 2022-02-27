const config = require('../config')
const https = require('https')
const express = require('express')
const serveStatic = require('serve-static')
const fs = require('fs')
const { Server } = require("socket.io")
const { ExpressPeerServer } = require('peer')
const cookieParser = require('cookie-parser')
const tokenValidator = require('./common/services/token-validator')
const authRouter = require('./authentication/services/router')

const expressApp = express()
const httpServer = https.createServer({
    key: fs.readFileSync(config.root + '/ssl/key.pem'),
    cert: fs.readFileSync(config.root + '/ssl/certificate.pem')
}, expressApp)
const socketServer = new Server(httpServer, {
    path: '/socket'
})
const peerServer = ExpressPeerServer(httpServer, {
    path: '/peer',
    port: config.port,
    ssl: {
        key: fs.readFileSync(config.root + '/ssl/key.pem'),
        cert: fs.readFileSync(config.root + '/ssl/certificate.pem')
    }
})
const streamSockets = new Set()

expressApp.set('view engine', 'ejs')

expressApp.use(serveStatic(config.root + '/static/react-content', { index: false }))
expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: false }))
expressApp.use(cookieParser())
expressApp.use(peerServer)

expressApp.get('/api/streams', (req, res) => {
    res.json(Array.from(streamSockets))
})

expressApp.use(authRouter)

expressApp.get('/*', tokenValidator, (_httpRequest, httpResponse) => {
    httpResponse.sendFile(config.root + '/static/react-content/index.html')
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
