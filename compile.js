const browserify = require('browserify');
const fs = require('fs');
const ReplaceStream = require(__dirname + '/lib/replace-stream.js');
const Simultaneity = require(__dirname + '/lib/simultaneity.js');
const uglify = require('uglify-js2');

function exposeFile(b, name, fileName = name) {
	b.require(__dirname + fileName, {expose: name});
}

console.log('Compiling');
let b = browserify();
b.add(fs.createReadStream(__dirname + '/client-side/upload.js'));

var s = new Simultaneity;
for (let utilFile of ['/lib/assert', '/structure-types']) {
	s.addTask(() => {
		fs.createReadStream(__dirname + utilFile + '.js')
		.pipe(new ReplaceStream("require('util')", "require('/lib/util-inspect.js')"))
		.pipe(fs.createWriteStream(__dirname + utilFile + '-no-util.js')).on('finish', () => {
			exposeFile(b, utilFile + '.js', utilFile + '-no-util.js')
			s.taskFinished();
		});
	});
}
s.callback(() => {
	exposeFile(b, '/client-side/binary-ajax.js');
	exposeFile(b, '/config.js');
	exposeFile(b, '/lib/buffer-stream.js');
	exposeFile(b, '/lib/growable-buffer.js');
	exposeFile(b, '/lib/bit-math.js');
	exposeFile(b, '/lib/strint.js');
	exposeFile(b, '/lib/util-inspect.js');
	b.transform('babelify', {presets: ['es2015']});
	b.bundle().pipe(fs.createWriteStream(__dirname + '/compiled/upload.js')).on('finish', () => {
		console.log('Uglifying');
		const uglified = uglify.minify(__dirname + '/compiled/upload.js').code;
		fs.writeFile(__dirname + '/compiled/upload.js', uglified, (err) => {
			if (err) throw err;
		});
	});
});