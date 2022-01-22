const config = require('./config.js')
const express = require('express')
const https = require('https')
const fs = require('fs')
const path = require('path')
const { Server } = require("socket.io")
const { ExpressPeerServer } = require('peer')
const app = express()
const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('certificate.pem')
}, app)
const io = new Server(server, {
    path: '/socket'
})
const peerServer = ExpressPeerServer(server, {
    path: '/peer',
    port: config.port,
    ssl: {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('certificate.pem')
    }
})

let streamSockets = new Set()

app.use(express.static('public'))
app.use(express.json())
app.use(peerServer)

app.get('/api/streams', (req, res) => {
    res.json(Array.from(streamSockets))
})

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

io.on('connection', (socket) => {
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

server.listen(config.port, () => {
    console.log(`listening on ${config.port}`)
})
