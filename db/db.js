/**
 * Created by lexlevi on 1/27/17.
 */
/* dependencies */
var constants = require("../constants");
var mongoose = require('mongoose');

module.exports.startDB = function () {
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
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log("Openned connection to " + constants.DB_INSTANCE);
        console.log("DB User:" + constants.DB_USER);
    });
}





