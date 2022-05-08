const Stream = require('../models/stream')

const streams = {}

const streamsService = {
    add(id) {
        streams[id] = new Stream(id, Date.now())
    },
    get() {
        return Object.values(streams)
    },
    delete(id) {
        delete streams[id]
    }
}

module.exports = streamsService