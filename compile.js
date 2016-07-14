const browserify = require('browserify');
const fs = require('fs');

function exposeFile(b, name) {
	b.require(__dirname + name, {expose: name});
}

let b = browserify();
b.add(fs.createReadStream(__dirname + '/client-side/upload.js'));
exposeFile(b, '/client-side/binary-ajax.js');
exposeFile(b, '/client-side/jquery.js');
exposeFile(b, '/config.js');
exposeFile(b, '/lib/assert.js');
exposeFile(b, '/lib/buffer-stream.js');
exposeFile(b, '/lib/growable-buffer.js');
exposeFile(b, '/lib/bit-math.js');
exposeFile(b, '/lib/strint.js');
exposeFile(b, '/structure-types.js');
b.transform('babelify', {presets: ['es2015']});
b.bundle().pipe(fs.createWriteStream(__dirname + '/compiled/upload.js'));