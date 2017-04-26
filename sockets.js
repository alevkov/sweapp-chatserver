var socketio = require('socket.io');
var constants = require('./constants');
var db = require('./db/db');
var ObjectId = require('mongodb').ObjectId;
var encryption = require("./encryption");

var users = {};
var clients = [];

// universal listen goes to www
module.exports.listen = function (app) {
    io = socketio(app);
    io.on(constants.ioConnection, function (socket) {
        console.log(socket.id + " connected");
        socket.on(constants.ioUserJoined, function (user, group) {
            //console.log(JSON.parse(user));
            socket.join(group);
            users[socket.id] = JSON.parse(user);
            io.sockets.emit(constants.ioUpdateJoin, users[socket.id]);
            io.sockets.emit(constants.ioUpdateUsers, users);
            clients.push(socket);
        });
        socket.on(constants.ioEnterChannel, function (channel) {
            console.log(socket.id + " joined channel " + channel);
            socket.join(channel);
        });
        socket.on(constants.ioLeaveChannel, function (channel) {
            console.log(socket.id + " left channel " + channel);
            socket.leave(channel);
        });
        socket.on(constants.ioNewMessage, function (channel, message) {
            var m = JSON.parse(message);
            var reply = new db.Message();
            reply.chat = ObjectId(m.chat);
            reply.body = encryption.encrypt(m.body);
            reply.author = m.author._id;
            reply.save(function(err, sentReply) {
                if (err)
                    console.log(err);
                else
                    io.sockets.in(channel).emit(constants.ioNewMessage, message);
            });
        });
        socket.on(constants.ioDisconnect, function () {
            console.log(socket.id + " disconnected");
        });
        socket.on(constants.ioTyping, function (user) {
            console.log(socket.id + "is typing");
        })
    });
    return io;
};
