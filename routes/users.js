var express = require('express');
var router = express.Router();
var db = require('../db/db');
var bcrypt = require('bcrypt');
var ObjectId = require('mongodb').ObjectId;

// GET Users listing
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

// GET Groups for user
router.get('/:id/groups', function(req, res, next) {
    db.User.findOne( { '_id': ObjectId(res.params.id) }, function (err, user) {
        if (err || user === null) {
            res.status(404);
            res.send({ "error": "User not found" });
        } else {
            db.Group.find({
                '_id': { $in: user.groups }
            }, function (err, groups) {
                if (err || groups === null || groups.empty()) {
                    res.status(404);
                    res.send([]);
                }
                res.status(200);
                res.send(groups);
            });
        }
    });
    res.send('respond with a resource');
});

module.exports = router;
