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
    db.Chat.find({ 'group': ObjectId(req.params.groupId) }, function (err, chats) {
        if (err || chats === null || chats.length === 0)
            res.status(400).send({ error: "No Chats in Group" });
        else
            res.status(200).send(chats);
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

// GET Participants (Users) for Chat
router.get('/:id/users', function (req, res) {
    db.Chat.findOne({ '_id': ObjectId(req.params.id) }, function (err, chat) {
        if (chat == null || err)
            res.status(400).send({ error: 'No Chat found for Id' });
        else {
            db.User.find({
                '_id': { $in: chat.participants }
            }, function (err, users) {
                if (err || users === null || users.length === 0)
                    res.status(400).send([]);
                else
                    res.status(200).send(users);
            });
        }
    });
});

// POST new Chat in Group
router.post('/group/:groupId/new', function (req, res) {
    var chat = new db.Chat();
    chat.participants = req.body.participants;
    chat.isGroupMessage = req.body.isGroupMessage;
    chat.name = req.body.name;
    chat.group = ObjectId(req.params.groupId);
    chat.save();
    res.status(200).send(chat);
});

// PATCH Chat by id
router.patch('/:id/update', function(req, res) {
    db.Chat.findOne({ '_id': ObjectId(req.params.id) }, function (err, chat) {
        if (err || chat === null)
            res.status(400).send({ error: "No Chat found for Id" });
        else {
            var updatedChat = req.body;
            var id = req.params.id;
            db.Chat.update({_id  : ObjectId(id)}, {$set: updatedChat}, function (err, chat) {
                if (err || chat === null)
                    res.status(500).send({ error: "Error saving Chat" });
                else
                    res.status(200).send(chat);
            });
        }
    })
});

// DELETE Chat by id
router.delete('/:id/delete', function (req, res) {
    db.Chat.findOne({ '_id': req.params.id }, function (err, chat) {
        if (err || chat === null)
            res.status(404).send({ error: "Chat not found" });
        else {
            chat.remove();
            res.status(200).send({ success: "Chat deleted" });
        }
    });
});

// POST new Message to Chat
router.post('/:id/messages/new', function (req, res) {
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
