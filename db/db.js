var constants = require("../constants");
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var instance;

SALT_WORK_FACTOR = 10;

// Course
var CourseSchema = mongoose.Schema({
    name: String,
    code: String
});

// User
var UserSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    password: String,
    email: String,
    courses: [CourseSchema],
    groups: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'Group'
        }
    ],
    major: String,
    year: String,
    days: [String],
    semester: String,
    academicYear: Number,
    contribution: Number
});

// Chat
var ChatSchema = new mongoose.Schema({
    name: String,
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    isGroupMessage : { type : Boolean, default : true },
    participants : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    ]
});

// Message
var MessageSchema = mongoose.Schema({
   chat: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Chat',
       required: true
   },
   body: {
       type: String
   },
   author: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
   }
}, {
    timestamps: true
});

// Group
var GroupSchema = mongoose.Schema({
    name: String,
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    creator: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    courses: [CourseSchema],
    chats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat'
        }
    ],
    semester: String,
    academicYear: Number,
    isPrivate: Boolean,
    days: [String]
});

// User middleware
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

UserSchema.post('remove', function (next) {
    var user = this;
    var GroupModel = mongoose.model('Group', GroupSchema);
    GroupModel.find({
        '_id': { $in: user.groups }
    }, function (err, groups) {
        if(err || groups === null) return next(err);
        else {
            for (var i = 0; i < groups.length; i++) {
                for (var j = 0; j < groups[i].participants.length; j++) {
                    if (groups[i].participants[j] == user.id) {
                        groups[i].participants.splice(j, 1);
                    }
                }
                groups[i].save();
            }
        }
    })
});

// Group middleware
GroupSchema.post('remove', function (next) {
    var group = this;
    var UserModel = mongoose.model('User', UserSchema);
    var ChatModel = mongoose.model('Chat', ChatSchema);
    // remove each chat for deleted group
    ChatModel.find({ 'group': group.id }, function (err,chats) {
        if (err || chats === null)
            next();
        else {
            for (var i = 0; i < chats.length; i++)
                chats[i].remove();
        }
    });
    // remove group ref from participants
    UserModel.find({
        '_id': { $in: group.participants }
    }, function(err, users){
        if (err || users === null) return next(err);
        else {
            for (var i = 0; i < users.length; i++) {
                for (var j = 0; j < users[i].groups.length; j++) {
                    if (users[i].groups[j] == group.id)
                        users[i].groups.splice(j, 1);
                }
                users[i].save();
            }
        }

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
        var Course = mongoose.model('Course', CourseSchema);
        var Group = mongoose.model('Group', GroupSchema);
        var Chat = mongoose.model('Chat', ChatSchema);
        var Message = mongoose.model('Message', MessageSchema);
        module.exports.User = User;
        module.exports.Course = Course;
        module.exports.Group = Group;
        module.exports.Chat = Chat;
        module.exports.Message = Message;
    });
    return db;
};

module.exports.disconnectDB = function () {
    instance = null;
};

module.exports.instance = function () {
    return instance;
};
