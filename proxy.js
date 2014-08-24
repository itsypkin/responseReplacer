'use strict';
var EventEmitter = require('events').EventEmitter,
    format = require('util').format,
    md5 = require('MD5'),
    _ = require('lodash'),
    http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

var responseStorage = {};
var showedResponses = {};

var emitter = new EventEmitter();

module.exports = emitter;

var addToShowed = function (res) {
    var key = md5(JSON.stringify(res.headers) + res.req.method + res.req._headers.host + res.req.path + res.statusCode);

    showedResponses[key] = true;

    (function (keyToDelete) {
        setTimeout(function () {
            delete showedResponses[keyToDelete];
        }, 2000);
    })(key);
};

var isShowed = function (res) {
    var key = md5(JSON.stringify(res.headers) + res.req.method + res.req._headers.host + res.req.path + res.statusCode);

    return showedResponses[key];
};


var setToStorage = function (res, data) {
    if (!Buffer.isBuffer(data)) {
        data = new Buffer(data);
    }
    var key = md5(res._header);
    if (!responseStorage[key]) {
        responseStorage[key] = {
            method: res.connection.parser.incoming.method,
            url: res.connection.parser.incoming.url,
            header: res._header,
            headers: res._headers,
            data: new Buffer(0)
        };
    }

    responseStorage[key].data = Buffer.concat([responseStorage[key].data, data]);
};

var getFromStorage = function (res) {
    var key = md5(res._header);

    var res = responseStorage[key];
    delete responseStorage[key];
    return res;
};


var server = http.createServer(function(req, res) {
    var target = req.url;

    if (_.first(target) === '/') {
        target = format('http://%s%s', req.headers.host, req.url);
    }
    var _write = res.write;

    res.write = function () {
        var args = _.toArray(arguments);
        setToStorage(res, args[0]);
        _write.apply(res, args);
    };

    res.on('finish', function () {
        if (res.statusCode !== 200) {
            return;
        }

        var result = getFromStorage(res);
        if (!result) {
            emitter.emit('no:info:header', res._header);
            return console.log('no info for header', res._header);
        }

        emitter.emit('new:request', {
            method: result.method,
            url: result.url,
            statusCode: res.statusCode,
            header: result.header,
            body: result.data
        });
    });


    proxy.web(req, res, { target: target });

    proxy.on('proxyRes', function (res) {
        if (res.statusCode !== 200 && !isShowed(res)) {
//            console.log('RAW Response from the target', res.headers);
//            console.log('[***req***]',res.req.method, res.req._headers.host, res.req.path, res.statusCode);
            emitter.emit('new:request', {
                method: res.req.method,
                url: res.req._headers.host + res.req.path,
                statusCode: res.statusCode,
                header: res.req._headers
            });

            addToShowed(res);
        }
    });

    proxy.on('error', function (err) {
        emitter.emit('error', err);
    });
});

process.nextTick(function () {
    emitter.emit('connected', 5050);
});
server.listen(5050);
