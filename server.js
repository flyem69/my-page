const config = require('./config.js')
const express = require('express')
const https = require('https')
const fs = require('fs')
const path = require('path')
const { Server } = require("socket.io")
const { ExpressPeerServer } = require('peer')
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

let streamSockets = new Set()

expressApp.use(express.static('public/authentication'))
expressApp.use(express.static('public/content-react'))
expressApp.use(express.json())
expressApp.use(peerServer)

expressApp.get('/api/streams', (req, res) => {
    res.json(Array.from(streamSockets))
})

expressApp.get('/*', (req, res, next) => {
    const bearerHeader = req.headers['authorization']
    if (bearerHeader) {
        next()
    } else {
        res.sendFile(path.join(__dirname, 'public', 'authentication', 'index.html'))
    }
}, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'content-react', 'index.html'))
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
