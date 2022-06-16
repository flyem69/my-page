const Stream = require('../models/stream')

const streams = {
    '123': new Stream('123', 'name', Date.now())
}

const streamsService = {
    add(id, author) {
        streams[id] = new Stream(id, author, Date.now())
    },
    getAll() {
        return Object.values(streams)
    },
    delete(id) {
        delete streams[id]
    }
}

module.exports = streamsService