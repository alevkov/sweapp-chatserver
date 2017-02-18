var express = require('express');
var router = express.Router();
var db = require('../db/db');
var bcrypt = require('bcrypt');

router.post('/',function(req, res){
    var email = req.body.email;
    var password = req.body.password;

    db.User.findOne({ 'email': email }, function (err, user) {
        if (err || user === null) {
            res.status(404);
            res.send({"error": "User not found"});
        } else {
            bcrypt.compare(password, user.password, function(err, isMatch) {
                if (err) {
                    res.status(err.status);
                    res.send({"error": err});
                }
                if(isMatch) res.send(user);
                else {
                    res.status(403);
                    res.send({"error": "Incorrect password"});
                }
            });
        }
    });
});

module.exports = router;
