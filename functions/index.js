const admin = require('firebase-admin');
admin.initializeApp();

exports.setUserRole = require('./auth').setUserRole;
exports.onUserStatusChange = require('./auth').onUserStatusChange;
exports.aiChat = require('./ai').aiChat;
