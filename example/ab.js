var metri = require('../')(process.argv[2]);
var qs = require('querystring');
var ent = require('ent');

var http = require('http');

function withMessage (msg) {
    return function (req, res, rec) {
        if (req.method === 'GET') {
            res.setHeader('content-type', 'text/html');
            res.end([
                '<form method="POST">',
                '<input type="submit" value="' + ent.encode(msg) + '">',
                '</form>',
            ].join('\n'));
        }
        else {
            rec('clicked');
            res.end('beep boop');
        }
    };
}

var versions = {
    a : withMessage('click the button'),
    b : withMessage('CLICK ZEE BUTTON'),
};
var buckets = {};

var sessionName = 'metri_session';
var server = http.createServer(function (req, res) {
    var cookies = (req.headers.cookie || '')
        .split(/\s*;\s*/)
        .reduce(function (acc, s) {
            var pair = s.split('=').map(decodeURI);
            acc[pair[0]] = pair[1];
            return acc;
        }, {})
    ;
    var id = cookies[sessionName] || Math.random().toString(16).slice(2);
    if (!cookies[sessionName]) {
        res.setHeader('set-cookie', sessionName + '=' + id);
    }
    
    if (!buckets[id]) {
        var keys = Object.keys(versions);
        buckets[id] = keys[Math.floor(Math.random() * keys.length)];
    }
    
    var key = buckets[id];
    var rec = metri.recorder(key, id);
    if (!cookies[sessionName]) rec('session');
    
    versions[key](req, res, rec);
});
server.listen(8000);
