// https://nodejs.org/en/knowledge/HTTP/servers/how-to-serve-static-files/
let static = require('node-static');
let http = require('http');

let file = new (static.Server)('public');

http.createServer((req, res) => file.serve(req, res)).listen(8080);