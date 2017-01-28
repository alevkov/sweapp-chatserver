/**
 * Created by lexlevi on 1/28/17.
 */
var express = require('express');
var router = express.Router();
var db = require('../db/db');

router.post('/',function(req, res){
    var user_name = req.body.user;
    var password = req.body.password;
    var first_name = req.body.firstName;
    var last_name = req.body.lastName;
    var email = req.body.email;
    var courses = req.body.courses;
    var major = req.body.major;
    var times = req.body.times;
    var year = req.body.year;
    var contrib = req.body.contribution;
    console.log("New User:");
    console.log("User name = " + email + ", password is " + password);
    var user = new db.User();
    user.userName = user_name;
    user.password = password;
    user.firstName = first_name;
    user.lastName = last_name;
    user.email = email;
    user.courses = courses;
    user.major = major;
    user.times = times;
    user.year = year;
    user.contrib = contrib;
    user.save();

    res.send(user);
});

module.exports = router;