require('dotenv').config()
const express = require('express')
const http = require('http')
const path = require('path')
const { Server } = require("socket.io")
const app = express()
const server = http.createServer(app)
const io = new Server(server)

let streamSockets = new Set()

app.use(express.static('public'))
app.use(express.json())

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

server.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`)
})
