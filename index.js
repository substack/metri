var request = require('request');
var EventEmitter = require('events').EventEmitter;

var chi = require('chi-squared');
var gtest = require('gtest');

module.exports = function (uri) {
    return new Metri(uri);
};

function Metri (uri) {
    this.uri = uri;
}

Metri.prototype = new EventEmitter;

Metri.prototype.recorder = function (experiment, session) {
    var self = this;
    return function () {
        var data = [].slice.call(arguments);
        return self.record(experiment, session, data);
    };
};
 
Metri.prototype.record = function (experiment, session, data) {
    var self = this;
    
    var req = request.post({
        uri : self.uri,
        headers : { 'content-type' : 'application/json' },
    });
    
    var doc = {
        time : Date.now(),
        experiment : experiment,
        session : session,
        data : data,
    };
    req.end(JSON.stringify(doc));
    self.emit('record', doc);
    
    var data = '';
    req.on('data', function (buf) { data += buf });
    req.on('end', function () {
        var obj = JSON.parse(data);
        if (obj.error) {
            self.emit('error', new Error(obj.error + ': ' + obj.reason));
        }
        else self.emit('response', obj);
    });
};
