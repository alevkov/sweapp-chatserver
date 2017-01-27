/**
 * Created by lexlevi on 1/26/17.
 */
var www = require('./bin/www')

/* Server reference */
var server = www.server

/**
 * Create Socket connector
 */

var io = require('socket.io')(server)

function socketEventListen() {
    io.on('connection', function (socket) {
        console.log("Someone connected")
    })

    io.on('disconnect', function (socket) {
        console.log("Someone disconnected")
    })
}

module.exports = socketEventListen