const browserify = require('browserify');
const fs = require('fs');

let b = browserify();
b.add(fs.createReadStream(__dirname + '/client-side/upload.js'));
b.require(__dirname + '/lib/assert.js', {expose: '//lib/assert.js'});
b.require('./lib/assert.js', {expose: '/lib/assert.js'});
b.require(__dirname + '/lib/buffer-stream.js', {expose: '//lib/buffer-stream.js'});
b.bundle().pipe(fs.createWriteStream(__dirname + '/compiled/upload.js'));