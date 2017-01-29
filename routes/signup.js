/**
 * Created by lexlevi on 1/28/17.
 */
var express = require('express');
var router = express.Router();
var db = require('../db/db');

router.post('/',function(req, res){
    var user = new db.User();
    user.userName = req.body.user;
    user.password = req.body.password;
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.courses = req.body.courses;
    user.major = req.body.major;
    user.times = req.body.times;
    user.year = req.body.year;
    user.contrib = req.body.contribution;
    user.save();
    console.log("New User:");
    console.log("User name = " + user.email + ", password is " + user.password);
    res.send(user);
});

module.exports = router;