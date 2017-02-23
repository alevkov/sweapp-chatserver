var socketio = require('socket.io');
var constants = require('./constants');

// universal listen goes to www
module.exports.listen = function (app) {
    io = socketio(app);
    io.on(constants.ioConnection, function (socket) {
        console.log("Someone connected");
        socket.on(constants.ioEnterChannel, function (channel) {
            socket.join(channel);
        });
        socket.on(constants.ioLeaveChannel, function (channel) {
            socket.leave(channel);
        });
        socket.on(constants.ioNewMessages, function (channel) {
            io.sockets.in(channel).emit(constants.ioRefreshMessages, channel);
        });
        socket.on(constants.ioDisconnect, function () {
            console.log("Someone disconnected");
        })
    });

    return io
};
