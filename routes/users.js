var express = require('express');
var router = express.Router();
var db = require('../db/db');
var bcrypt = require('bcrypt');
var ObjectId = require('mongodb').ObjectId;

// GET all Users
router.get('/', function(req, res, next) {
    db.User.find(function (err, users) {
        if (err || users === null)
            res.status(404).send({ error: "No users found" });
        else
            res.send(users);
    });
});

// GET User for Id
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
    user.contrib = 1;
    user.semester = req.body.semester;
    user.academicYear = d.getFullYear();
    user.save(function (err, user) {
        if (err || user === null) {
            res.status(500).send({ error: "Error saving user to DB" });
        } else {
            console.log("New User:");
            console.log("User name = " + user.email + ", password is " + user.password);
            res.send(user);
        }
    });
});

// GET Groups for User
router.get('/:id/groups', function(req, res, next) {
    db.User.findOne( { '_id': ObjectId(req.params.id) }, function (err, user) {
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

module.exports = router;
