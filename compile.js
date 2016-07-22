/*eslint-disable no-console*/
const browserify = require('browserify');
const fs = require('fs');
const ReplaceStream = require(__dirname + '/lib/replace-stream.js');
const Simultaneity = require(__dirname + '/lib/simultaneity.js');
const uglify = require('uglify-js');

function exposeFile(b, name, fileName = name) {
	b.require(__dirname + fileName, {expose: name});
}

let uploadB = browserify();
uploadB.add(__dirname + '/client-side/upload.js');
let downloadB = browserify();
downloadB.add(__dirname + '/client-side/download.js');

let s = new Simultaneity;
for (let utilFile of ['/lib/assert', '/structure-types', '/read']) {
	s.addTask(() => {
		fs.createReadStream(__dirname + utilFile + '.js')
		.pipe(new ReplaceStream("require('util')", "require('/lib/util-inspect.js')"))
		.pipe(fs.createWriteStream(__dirname + utilFile + '-noutil.js')).on('finish', () => {
			s.taskFinished();
		});
	});
}
for (let zlibFile of ['/io']) {
	s.addTask(() => {
		fs.createReadStream(__dirname + zlibFile + '.js')
		.pipe(new ReplaceStream("const zlib = require('zlib');\n", ''))
		.pipe(fs.createWriteStream(__dirname + zlibFile + '-nozlib.js')).on('finish', () => {
			s.taskFinished();
		});
	});
}
console.log('Replacing large dependencies');
s.callback(() => {
	compile(uploadB, {
		modifiedFiles: {
			noutil: ['/lib/assert', '/structure-types']
		},
		exposeFiles: [
			'/client-side/binary-ajax.js',
			'/config.js',
			'/lib/buffer-stream.js',
			'/lib/growable-buffer.js',
			'/lib/bit-math.js',
			'/lib/strint.js',
			'/lib/util-inspect.js'
		],
		outputFile: '/compiled/upload.js'
	});
	compile(downloadB, {
		modifiedFiles: {
			noutil: ['/lib/assert', '/structure-types', '/read'],
			nozlib: ['/io']
		},
		exposeFiles: [
			'/client-side/binary-ajax.js',
			'/config.js',
			'/lib/buffer-stream.js',
			'/lib/growable-buffer.js',
			'/lib/bit-math.js',
			'/lib/strint.js',
			'/lib/util-inspect.js'
		],
		outputFile: '/compiled/download.js'
	});
});
function compile(b, {modifiedFiles, exposeFiles, outputFile}) {
	console.log('Compiling ' + outputFile);
	for (let ending in modifiedFiles) {
		for (let file of modifiedFiles[ending]) exposeFile(b, file + '.js', file + '-' + ending + '.js');
	}
	for (let file of exposeFiles) exposeFile(b, file);
	b.transform('babelify', {presets: ['es2015']});
	b.bundle().pipe(fs.createWriteStream(__dirname + outputFile)).on('finish', () => {
		console.log('Uglifying ' + outputFile);
		const uglified = uglify.minify(__dirname + outputFile).code;
		fs.writeFile(__dirname + outputFile, uglified, (err) => {
			if (err) throw err;
		});
	});
}