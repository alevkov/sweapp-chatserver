var express = require('express');
var router = express.Router();
var db = require('../db/db');

router.get('/', function(req, res, next) {
    db.Course.find(function (err, courses) {
        if (err || courses === null) {
            res.status(404);
            res.send({"error": "No courses found"});
        }
        res.send(courses);
    });
});

module.exports = router;
