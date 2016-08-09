/*eslint-disable no-console*/
const browserify = require('browserify');
const fs = require('fs');
const ReplaceStream = require(__dirname + '/lib/replace-stream.js');
const Simultaneity = require(__dirname + '/lib/simultaneity.js');
const uglify = require('uglify-js');

const uploadB = browserify();
uploadB.add(__dirname + '/client-side/upload.js');
const downloadB = browserify();
downloadB.add(__dirname + '/client-side/download.js');
const uploadDownloadB = browserify();
uploadDownloadB.add(__dirname + '/client-side/upload-download.js');

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
s.addTask(() => {
	let uploadCode, downloadCode;
	const loadS = new Simultaneity;
	loadS.addTask(() => {
		fs.readFile(__dirname + '/client-side/upload.js', (err, data) => {
			if (err) throw err;
			uploadCode = data;
			loadS.taskFinished();
		});
	});
	loadS.addTask(() => {
		fs.readFile(__dirname + '/client-side/download.js', (err, data) => {
			if (err) throw err;
			downloadCode = data;
			loadS.taskFinished();
		});
	});
	loadS.callback(() => {
		fs.writeFile(
			__dirname + '/client-side/upload-download.js',
			Buffer.concat([uploadCode, downloadCode]),
			(err) => {
				if (err) throw err;
				s.taskFinished();
			}
		);
	});
});
console.log('Compiling: Replacing large dependencies');
const downloadFiles = [
	'/client-side/binary-ajax.js',
	'/client-side/common.js',
	'/config.js',
	'/lib/bit-math.js',
	'/lib/buffer-string.js',
	'/lib/growable-buffer.js',
	'/lib/strint.js',
	'/lib/util-inspect.js'
];
s.callback(() => {
	function exposeFile(b, name, fileName = name) {
		b.require(__dirname + fileName, {expose: name});
	}
	function compile(b, {modifiedFiles, exposeFiles, outputFile}) {
		console.log('Compiling: Browserifying and babelifying ' + outputFile);
		for (let ending in modifiedFiles) {
			for (let file of modifiedFiles[ending]) exposeFile(b, file + '.js', file + '-' + ending + '.js');
		}
		for (let file of exposeFiles) exposeFile(b, file);
		b.transform('babelify', {presets: ['es2015']});
		b.bundle().pipe(fs.createWriteStream(__dirname + outputFile)).on('finish', () => {
			console.log('Compiling: Uglifying ' + outputFile);
			const uglified = uglify.minify(__dirname + outputFile).code;
			fs.writeFile(__dirname + outputFile, uglified, (err) => {
				if (err) throw err;
			});
		});
	}
	compile(uploadB, {
		modifiedFiles: {
			noutil: ['/lib/assert', '/structure-types']
		},
		exposeFiles: [
			'/client-side/binary-ajax.js',
			'/client-side/common.js',
			'/config.js',
			'/lib/bit-math.js',
			'/lib/buffer-string.js',
			'/lib/growable-buffer.js',
			'/lib/strint.js',
			'/lib/util-inspect.js'
		],
		outputFile: '/compiled/upload.js'
	});
	compile(downloadB, {
		modifiedFiles: {
			noutil: ['/lib/assert', '/structure-types', '/read']
		},
		exposeFiles: downloadFiles,
		outputFile: '/compiled/download.js'
	});
	compile(uploadDownloadB, {
		modifiedFiles: {
			noutil: ['/lib/assert', '/structure-types', '/read']
		},
		exposeFiles: downloadFiles,
		outputFile: '/compiled/upload-download.js'
	});
});