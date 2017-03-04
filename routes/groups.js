var express = require('express');
var router = express.Router();
var db = require('../db/db');
var constants = require("../constants");
var ObjectId = require('mongodb').ObjectId;

// GET Group for Id
router.get('/:id', function (req, res) {
    db.Group.findOne({ '_id': ObjectId(req.params.id)}, function (err, group) {
        if (err || group === null)
            res.status(400).send({ error: "No Group found for Id" });
        else
            res.status(200).send(group);
    })
});

// POST to create new Group for User
router.post('/user/:id',function(req, res){
    db.User.findOne( { '_id': ObjectId(req.params.id) }, function (err, user) {
        if (err || user === null) {
            res.status(404).send({ error: "User not found" });
        } else {
            // list of group id's
            var group = new db.Group;
            var generalChannel = new db.Chat;
            // General channel
            generalChannel.name = constants.general;
            generalChannel.group = group.id;
            generalChannel.isGroupMessage = true;
            generalChannel.participants.push(user.id);
            generalChannel.save();
            // Group created
            group.name = req.body.name;
            group.desc = req.body.description;
            group.creator = user.id;
            group.participants.push(user.id);
            group.courses = req.body.courses;
            group.chats.push(generalChannel.id);
            group.semester = req.body.semester;
            group.academicYear = req.body.academicYear;
            group.isPrivate = req.body.isPrivate;
            group.days = req.body.days;
            group.save();
            user.groups.push(group.id);
            user.save();
            console.log(group);
            res.status(200).send(group);
        }
    });
});

// PATCH Group by id
router.patch('/:id', function(req, res) {
    db.Group.findOne({ '_id': ObjectId(req.params.id) }, function (err, group) {
        if (err || group === null)
            res.status(400).send({ error: "No Group found for Id" });
        else {
            var updatedGroup = req.body;
            var id = req.params.id;
            db.Group.update({_id  : ObjectId(id)}, {$set: updatedGroup}, function (err, group) {
                if (err || group === null)
                    res.status(500).send({ error: "Error saving Group" });
                else
                    res.status(200).send(group);
            });
        }
    })
});

// DELETE Group by id
router.delete('/:id', function (req, res) {
   db.Group.findOne({ '_id': req.params.id }, function (err, group) {
       if (err || group === null)
           res.status(404).send({ error: "Group not found" });
       else {
           group.remove();
           res.status(200).send({ success: "Group deleted" });
       }
   });
});

// GET all groups for User
router.get('/user/:id', function (req, res) {
    db.User.findOne({ '_id': ObjectId(req.params.id) }, function (err, user) {
        if (err || user === null) {
            res.status(404);
            res.send({ error: "User not found" });
        } else {
            db.Group.find({
                '_id': { $in: user.groups }
            }, function (err, groups) {
                if (err || groups === null || groups.length === 0)
                    res.status(400).send([]);
                else
                    res.status(200).send(groups);
            });
        }
    });
});

// GET all Users for Group
router.get('/:id/users', function (req,res) {
   db.Group.findOne({ '_id': ObjectId(req.params.id) }, function (err, group) {
       if (err || group === null) {
           res.status(400);
           res.send({ error: "Group not found" });
       } else {
           db.User.find({
               '_id': { $in: group.participants }
           }, function (err, users) {
               if (err || users === null || users.length === 0)
                   res.status(400).send([]);
               else
                   res.status(200).send(users);
           });
       }
   })
});

module.exports = router;
