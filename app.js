var express = require('express');
var app = express();
var server = require('http').Server(app);

var path = require('path');
var favicon = require('static-favicon');

var index = require('./routes/index');
var proxyEmitter = require('./proxy');


proxyEmitter.on('connected', function (port) {
    console.log('Proxy is listening on port:', port);
});

var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);

app.use(favicon());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

var startEmitRequest = function (socket) {
    console.log('[*] start emitting new urls');
    proxyEmitter.on('new:request', function (data) {
        socket.emit('new:url', data);
    });
};

var stopEmitRequest = function () {
    proxyEmitter.removeAllListeners(['new:request']);
};


proxyEmitter.on('error', function (error) {
    console.log('[error]', error, JSON.stringify(error));
});


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

io.on('connection', function (socket) {
    console.log('client connected');

    socket.on('start', function () {
        startEmitRequest(socket);
    });

    socket.on('stop', function () {
        stopEmitRequest();
    });
});


server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
