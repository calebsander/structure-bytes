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
//Replace require('util'), which is only used for util.inspect(), to minimize file size
for (const utilFile of ['/lib/assert', '/structure-types', '/read']) {
	s.addTask(() => {
		fs.createReadStream(__dirname + utilFile + '.js')
		.pipe(new ReplaceStream("require('util')", "require('/lib/util-inspect.js')"))
		.pipe(fs.createWriteStream(__dirname + utilFile + '-noutil.js')).on('finish', () => {
			s.taskFinished();
		});
	});
}
s.addTask(() => {
	//Load the upload and download code and append them to each other to make a combined include file
	//These files are not too big, so it is not terrible to load them into memory
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
			err => {
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
	//Include the file in the browserify result because it is require()d by other files
	function exposeFile(b, name, fileName = name) {
		b.require(__dirname + fileName, {expose: name});
	}
	function compile(b, {modifiedFiles, exposeFiles, outputFile}) {
		console.log('Compiling: Browserifying and babelifying ' + outputFile);
		//Expose the files with require('util') removed in place of the true file
		for (const ending in modifiedFiles) {
			for (const file of modifiedFiles[ending]) exposeFile(b, file + '.js', file + '-' + ending + '.js');
		}
		//Expose all the unmodified files as normal
		for (const file of exposeFiles) exposeFile(b, file);
		b.transform('babelify', {presets: ['es2015']}); //babelify so it works in older browsers
		const chunks = [];
		b.bundle().on('data', chunk => chunks.push(chunk)).on('end', () => { //load output into memory
			console.log('Compiling: Uglifying ' + outputFile);
			const uglified = uglify.minify(Buffer.concat(chunks).toString(), { //minify the code
				fromString: true,
				compress: {unsafe: true}
			}).code;
			fs.writeFile(__dirname + outputFile, uglified, err => { //write out the minified code
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