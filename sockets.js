/**
 * Created by lexlevi on 1/27/17.
 */
// get package instance
var socketio = require('socket.io');

// universal listen goes to www
module.exports.listen = function (app) {
    // get io instance based on server running
    io = socketio(app);

    // event on connection
    io.on('connection', function (socket) {
        console.log("Someone connected");
        socket.on('disconnect', function (socket) {
            console.log("Someone disconnected");
        })
    })

    return io
}