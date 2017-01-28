/**
 * Created by lexlevi on 1/27/17.
 */
var express = require('express');
var router = express.Router();
var db = require('../db/db');

/* GET users listing. */
router.post('/',function(req, res){
    var user_name = req.body.user;
    var password = req.body.password;
    console.log(req.body);
    console.log("User name = " + user_name + ", password is " + password);
});

module.exports = router;