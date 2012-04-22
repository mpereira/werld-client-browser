#!/usr/bin/env node

var fs = require('fs');
var express = require('express');
var config = JSON.parse(fs.readFileSync('package.json')).config;
var server = express.createServer();

server.use('/javascripts', express.static('build/javascripts'));
server.use('/stylesheets', express.static('build/stylesheets'));
server.use('/images', express.static('assets/images'));
server.use('/sounds', express.static('assets/sounds'));
server.use('/webfonts', express.static('assets/webfonts'));
server.use('/assets', express.static('assets'));
server.use('/src', express.static('src'));
server.use('/vendor', express.static('vendor'));

server.use(express.favicon('assets/favicon.ico'));

server.get('/', function(request, result) {
  fs.createReadStream('build/index.html').pipe(result);
});

server.listen(config.port);
console.log('Server listening on http://0.0.0.0:' + config.port);
