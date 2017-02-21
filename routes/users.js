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

// GET Groups for User
router.get('/:id/groups', function(req, res, next) {
    db.User.findOne( { '_id': ObjectId(req.params.id) }, function (err, user) {
        if (err || user === null)
            res.status(404).send({ error: "User not found" });
        else {
            db.Group.find({
                '_id': { $in: user.groups }
            }, function (err, groups) {
                if (err || groups === null || groups.length === 0) {
                    res.status(404).send({ error: "User has no Groups" });
                } else {
                    res.status(200).send(groups);
                }
            });
        }
    });
});

module.exports = router;
