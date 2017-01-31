var express = require('express');
var router = express.Router();
var db = require('../db/db');
var bcrypt = require('bcrypt');

router.post('/',function(req, res){
    var email = req.body.email;
    var password = req.body.password;

    db.User.findOne({ 'email': email }, 'password', function (err, user) {
        if (err || user === null) {
            res.send({"error": "User not found"});
        } else {
            bcrypt.compare(password, user.password, function(err, isMatch) {
                if (err) res.send({"error": err});
                if(isMatch) res.send({"success": "Authentication Successful"});
                else res.send({"error": "Incorrect password"});
            });
        }
    });
    console.log(req.body);
});

module.exports = router;
