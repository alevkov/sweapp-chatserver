var express = require('express');
var router = express.Router();
var db = require('../db/db');
var constants = require("../constants");
var ObjectId = require('mongodb').ObjectId;

// GET all Groups for Course
router.get('/course/:code/', function (req, res) {
   var courseCode = req.params.code;
   var courseSemester = req.query.semester;
   var courseYear = req.query.academicYear;
   db.Group.find({}, { semester: courseSemester,
                        academicYear: courseYear,
                        isPrivate: false,
                        courses: { $elemMatch: { 'code': courseCode } } }, function (err, groups) {
       if (err || groups.empty() || groups === null) {
           res.status(404);
           res.send({ "error" : "Groups not found for course" })
       } else {
           res.status(200);
           res.send(groups);
       }
   })
});

// POST to create new group for User
router.post('/user/:id',function(req, res){
    db.User.findOne( { '_id': ObjectId(res.params.id) }, function (err, user) {
        if (err || user === null) {
            res.status(404);
            res.send({ "error": "User not found" });
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
            res.status(200);
            res.send(group);
        }
    });
});

// GET all groups for User
router.get('/user/:id', function (req, res) {
    db.User.findOne({ '_id': ObjectId(res.params.id) }, function (err, user) {
        if (err || user === null) {
            res.status(404);
            res.send({ "error": "User not found" });
        } else {
            db.Group.find({
                '_id': { $in: user.groups }
            }, function (err, groups) {
                if (err || groups === null || groups.empty()) {
                    res.send(400);
                    res.send([]);
                }
                res.send(200);
                res.send(groups);
            });
        }
    });
});

// GET all users for Group
router.get('/:id/users', function (req,res) {
   db.Group.find({ '_id': ObjectId(res.params.id) }, function (err, group) {
       if (err || group === null) {
           res.status(400);
           res.send({ "error": "Group not found" });
       } else {
           db.User.find({
               '_id': { $in: group.participants }
           }, function (err, users) {
               if (err || users === null || users.empty()) {
                   res.send(400);
                   res.send([]);
               } else {
                   res.send(200);
                   res.send(users);
               }
           });
       }
   })
});

module.exports = router;
