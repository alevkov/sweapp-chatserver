var express = require('express');
var router = express.Router();
var db = require('../db/db');
var bcrypt = require('bcrypt');
var ObjectId = require('mongodb').ObjectId;
var _ = require('underscore');

// GET all Users
router.get('/', function(req, res, next) {
    db.User.find(function (err, users) {
        if (err || users === null)
            res.status(404).send({ error: "No users found" });
        else
            res.send(users);
    });
});

// GET User by id
router.get('/:id', function (req, res) {
    db.User.findOne({ '_id': ObjectId(req.params.id)}, function (err, user) {
        if (err || user === null)
            res.status(400).send({ error: "No User found for Id" });
        else
            res.status(200).send(user);
    })
});

// POST to Login
router.post('/login',function(req, res){
    var email = req.body.email;
    var password = req.body.password;
    db.User.findOne({ 'email': email }, function (err, user) {
        if (err || user === null)
            res.status(404).send({ error: "User not found" });
        else {
            bcrypt.compare(password, user.password, function(err, isMatch) {
                if (err)
                    res.status(err.status).send({ error: err });
                else {
                    if(isMatch)
                        res.send(user);
                    else
                        res.status(403).send({ error: "Incorrect password" });
                }
            });
        }
    });
});

// POST to Register new User
router.post('/new',function(req, res){
    var user = new db.User();
    var d = new Date();
    user.userName = req.body.userName;
    user.password = req.body.password;
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.courses = req.body.courses;
    user.major = req.body.major;
    user.days = req.body.days;
    user.year = req.body.year;
    user.contribution = 1;
    user.semester = req.body.semester;
    user.academicYear = d.getFullYear();
    user.save(function (err, user) {
        if (err || user === null) {
            res.status(500).send({ error: "Error saving user to DB" });
        } else {
            console.log("New User:");
            console.log("User name = " + user.email + ", password is " + user.password);
            res.status(200).send(user);
        }
    });
});

// PATCH User by id
router.patch('/:id', function(req, res) {
    db.User.findOne({ '_id': ObjectId(req.params.id) }, function (err, user) {
        if (err || user === null)
            res.status(400).send({ error: "No User found for Id" });
        else {
            var updatedUser = req.body;
            var id = req.params.id;
            db.User.update({_id  : ObjectId(id)}, {$set: updatedUser}, function (err, user) {
                if (err || user === null)
                    res.status(500).send({ error: "Error saving User" });
                else
                    res.status(200).send(user);
            });
        }
    })
});

// DELETE User with Id
router.delete('/:id', function (req, res) {
    db.User.findOne({ '_id': req.params.id }, function (err, user) {
        if (err || user === null)
            res.status(500).send({ error: "User not found" });
        else {
            user.remove();
            return res.status(200).send({ success: user });
        }
    });
});

// GET Groups for User
router.get('/:id/groups', function(req, res, next) {
    db.User.findOne({ '_id': ObjectId(req.params.id) }, function (err, user) {
        if (err || user === null)
            res.status(404).send({ error: "User not found" });
        else {
            db.Group.find({
                '_id': { $in: user.groups }
            }, function (err, groups) {
                if (err || groups === null || groups.length === 0)
                    res.status(404).send({ error: "User has no Groups" });
                else
                    res.status(200).send(groups);
            });
        }
    });
});

// GET Matching Users for User
router.get('/:id/match', function (req, res) {
    db.User.findOne({ '_id': ObjectId(req.params.id) }, function (err, user) {
        if (err || user === null)
            res.status(404).send({ error: "User not found" });
        else {
            db.User.aggregate( // match by сourses
                { $match: { courses: { $in: user.courses } } } ,
                { $unwind: "$courses" },
                { $match: { courses: { $in: user.courses } } },
                { $group: {
                    _id: "$_id",
                    matches:{ $sum: 1 }
                } },
                { $sort:{ matches: -1 } }, function (err, matches) {
                    if (err || matches === null || matches.length === 0)
                        res.status(404).send({ error: "No Matches Found "});
                    else {
                        var matchedIds = [];
                        // remove current user's id
                        for (var i = 0; i < matches.length; i++) {
                            if (matches[i]._id.equals(user._id))
                                matches.splice(i, 1);
                        }
                        // push to id's array
                        for (var j = 0; j < matches.length; j++) {
                           if (!matches[j]._id.equals(user._id))
                                matchedIds.push(matches[j]._id);
                        }
                        // find matching users
                        db.User.find({
                            _id: { $in: matchedIds }
                        }).exec(function (err, users) {
                            // sort users by matching courses
                            // might not be the most efficient approach?
                            users.sort(function (a, b) {
                                return _.findIndex(matchedIds, function (id) { return a._id.equals(id); }) -
                                    _.findIndex(matchedIds, function (id) { return b._id.equals(id); });
                            });
                            var matchArray = [];
                            // bring matching majors to front if number of courses matching is the same
                            for (var k = 0; k < matches.length - 1; k++) {
                                if (matches[k].matches == matches[k + 1].matches &&
                                    users[k + 1].major === user.major) {
                                        var t = users[k];
                                        users[k] = users[k + 1];
                                        users[k + 1] = t;
                                }
                            }
                            for (var l = 0; l < users.length; l++) {
                                var result = {}; // holds users with matches key
                                result['user'] = users[l];
                                result['matches'] = matches[l]["matches"];
                                matchArray.push(result);
                            }
                            res.status(200).send(matchArray);
                        })
                    }
                });
        }
    });
});

module.exports = router;
