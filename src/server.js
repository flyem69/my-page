const config = require('../config')
const https = require('https')
const express = require('express')
const serveStatic = require('serve-static')
const fs = require('fs')
const { Server } = require("socket.io")
const { ExpressPeerServer } = require('peer')
const cookieParser = require('cookie-parser')
const streamsService = require('./streams/services/streams')
const authentication = require('./authentication/middleware/authentication')
const authRouter = require('./authentication/services/router')
const streamsRouter = require('./streams/services/router')

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

expressApp.set('view engine', 'ejs')

expressApp.use(serveStatic(config.root + '/static/react-content', { index: false }))
expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: false }))
expressApp.use(cookieParser())
expressApp.use(peerServer)

expressApp.use(authRouter)
expressApp.use(streamsRouter)

expressApp.get('/*', authentication, (_httpRequest, httpResponse) => {
    httpResponse.sendFile(config.root + '/static/react-content/index.html')
})

socketServer.on('connection', (socket) => {
    socket.on('disconnect', () => {
        streamsService.delete(socket.id)
    })
    socket.on('joinStream', (streamId, userId) => {
        if (socket.id !== streamId) {
            socket.join(streamId)
        }
        socket.to(streamId).emit('viewerJoining', userId)
    })
    socket.on('leaveStream', (streamId, userId) => {
        socket.to(streamId).emit('viewerLeaving', userId)
        if (socket.id !== streamId) {
            socket.leave(streamId)
        }
    })
    socket.on('registerStream', () => {
        streamsService.add(socket.id)
    })
    socket.on('deregisterStream', () => {
        streamsService.delete(socket.id)
    })
})

httpServer.listen(config.port, () => {
    console.log(`listening on ${config.port}`)
})
