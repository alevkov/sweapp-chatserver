var express = require('express');
var router = express.Router();
var db = require('../db/db');
var constants = require("../constants");
var ObjectId = require('mongodb').ObjectId;
var encryption = require("../encryption");

// GET Chat for Id
router.get('/:id', function (req, res) {
    db.Chat.findOne({ '_id': ObjectId(req.params.id)}, function (err, chat) {
        if (err || chat === null)
            res.status(400).send({ error: "No Chat found for Id" });
        else
            res.status(200).send(chat);
    })
});

// GET Chats for Group
router.get('/group/:groupId', function (req, res) {
    db.Chat.find({ 'group': ObjectId(req.params.groupId) }, '_id', function (err, chats) {
        if (err || chats === null || chats.length === 0)
            res.status(400).send({ error: "No Chats in Group" });
        // array to hold conversations + most recent messages
        var fullChats = [];
        chats.forEach(function(chat) {
            db.Message.find({ 'chat': chat.id })
                .sort('-createdAt')
                .limit(1)
                .populate({
                    path: 'author',
                    select: "firstName lastName userName"
                })
                .exec(function (err, message) {
                    if (err)
                        res.status(400).send({ error: "No Messages in Chat" });
                    else {
                        fullChats.push(message);
                        if (fullChats.length === chats.length) {
                            return res.status(200).json({ conversations: fullChats });
                        }
                    }
                })
        })

    });
});

// GET Messages for Chat
router.get('/:id/messages', function (req, res) {
    db.Message.find({ 'chat': req.params.id }, 'createdAt body author chat')
        .sort('-createdAt')
        .populate({
            path: 'author',
            select: 'firstName lastName userName'
        }).exec(function (err, messages) {
            if (err || messages === null || messages.length === 0)
                res.status(404).send({ error: "No Messages Found for Channel" });
            else {
                for (var i = 0; i < messages.length; i++)
                    messages[i].body = encryption.decrypt(messages[i].body);
                res.status(200).send(messages);
            }
    });
});

// POST new Chat in Group
router.post('/group/:groupId', function (req, res) {
    if (!req.user)
        res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
    if (!req.message)
        res.status(422).send({ error: 'Please enter a message.' });
    var chat = new db.Chat();
    chat.participants = [req.user.id];
    for (p in req.body.participants) {
        chat.participants.push(ObjectId(p.id));
    }
    chat.isPrivate = req.body.isPrivate;
    chat.name = req.body.name;
    chat.group = ObjectId(req.params.id);
    chat.save(function (err, newChat) {
        if (err)
            res.send({ error: err });
        var message = new db.Message();
        message.chat = newChat.id;
        messaeg.body = req.message.body;
        message.author = req.message.author;
        message.save(function(err, newMessage) {
            if (err)
                res.send({ error: err });
            else
                res.status(200).send(chat);
        });

    })
});

// POST new Message to Chat
router.post('/:id/message/new', function (req, res) {
    var reply = new db.Message();
    reply.chat = ObjectId(req.params.id);
    reply.body = encryption.encrypt(req.body.body);
    reply.author = req.body.author;
    reply.save(function(err, sentReply) {
        if (err)
            res.send({ error: err });
        else
            res.status(200).send(sentReply);
    });
});

module.exports = router;
