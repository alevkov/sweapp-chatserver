/**
 * Created by lexlevi on 1/27/17.
 */
/* dependencies */
var constants = require("../constants");
var mongoose = require('mongoose');
var instance;
var bcrypt = require('bcrypt');

SALT_WORK_FACTOR = 10;

/*
   SCHEMAS
 */

// User Schema

var UserSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    password: String,
    email: String,
    courses: [String],
    currentCourse: String,
    major: String,
    year: String,
    times: [
            {days: [String],
            times:[Date]}
            ],
    contribution: Number
});

UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

// Other Schema
// ...

module.exports.startDB = function (io) {
    /**
     * Set up remote db
     */
    mongoose.connect(constants.DB_PROTOCOL +
        constants.DB_USER + ':' +
        constants.DB_PWD +
        constants.DB_INSTANCE);

    /**
     * Open connection
     */
    var db = mongoose.connection;
    instance = db;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        io.emit(constants.dbOpenEvent);
        console.log("Openned connection to " + constants.DB_INSTANCE);
        console.log("DB User:" + constants.DB_USER);

        /* Schema Exports */
        var User = mongoose.model('User', UserSchema);
        module.exports.User = User;
    });

    return db;
};

module.exports.disconnectDB = function () {
    instance = null;
};

module.exports.instance = function () {
    return instance;
};




