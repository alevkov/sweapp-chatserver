function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

// db
define("DB_USER", "root");
define("DB_PWD", "sandwhich");
define("DB_PROTOCOL", "mongodb://");
define("DB_INSTANCE", "@ds133249.mlab.com:33249/swep-chat");

// server
define("HOST", "localhost");
define("PORT", '3000');

// socket events
define("dbOpenEvent", "databaseConnectionOpened");
define("dbCloseEvent", "databaseConnectionClosed");
define("ioConnection", "connection");
define("ioEnterChannel", "enterChannel");
define("ioLeaveChannel", "leaveChannel");
define("ioNewMessage", "newMessage");
define("ioRefreshMessages", "refreshMessages");
define("ioDisconnect", "disconnect");
define("ioTyping", "typing");

// Chat
define("general", "general");
