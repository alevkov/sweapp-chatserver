var constants = require("../constants");
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var instance;

SALT_WORK_FACTOR = 10;

// Course
var CourseSchema = mongoose.Schema({
    name: String,
    code: String,
    professorName: String,
    major: String
});

// User
var UserSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    password: String,
    email: String,
    courses: [CourseSchema],
    major: String,
    year: String,
    days: [String],
    contribution: Number
});

// Group
var GroupSchema = mongoose.Schema({
    name: String,
    participants: [UserSchema],
    course: CourseSchema,
    term: String,
    major: String,
    days: [String]
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

module.exports.startDB = function (io) {
    mongoose.connect(constants.DB_PROTOCOL +
        constants.DB_USER + ':' +
        constants.DB_PWD +
        constants.DB_INSTANCE);
    var db = mongoose.connection;
    instance = db;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        io.emit(constants.dbOpenEvent);
        console.log("Openned connection to " + constants.DB_INSTANCE);
        console.log("DB User:" + constants.DB_USER);
        // Schema exports
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
