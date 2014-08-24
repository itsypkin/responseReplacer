'use strict';

var io = require('socket.io-client');
var socket = io.connect('http://localhost');

module.exports = function () {
    return socket;
};