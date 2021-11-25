require('dotenv').config()
const express = require('express')
const http = require('http')
const path = require('path')
const cors = require('cors')
const { Server } = require("socket.io")
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    serveClient: false,
    cors: {
        origin: '*',
        methods: ['get', 'post']
    }
})
const deregisterStream = (socket) => {
    const index = streams.indexOf(socket.id)
    if (index >= 0) {
        streams.splice(index, 1)
    }
}
let streams = []

app.use(express.static('public'))
app.use(express.json())
app.use(cors())

app.get('/api/streams', (req, res) => {
    res.json({streams: streams})
})

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

io.on('connection', (socket) => {
    console.log(`new connection: ${socket.id}`)
    socket.on('disconnect', () => {
        console.log(`disconnected: ${socket.id}`)
        deregisterStream(socket)
    })
    socket.on('joinStream', (streamId) => {
        const index = streams.indexOf(streamId)
        if (index >= 0) {
            socket.join(streamId)
        }
    })
    socket.on('leaveStream', (streamId) => {
        socket.leave(streamId)
    })
    socket.on('registerStream', () => {
        const index = streams.indexOf(socket.id)
        if (index < 0) {
            streams.push(socket.id)
        }
    })
    socket.on('deregisterStream', () => {
        deregisterStream(socket)
    })
    socket.on('stream', (data) => {
        socket.to(socket.id).emit('streamData', data)
    })
})

server.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`)
})