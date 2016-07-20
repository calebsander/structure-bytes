/* eslint-disable no-unused-vars, no-console*/
const fs = require('fs');

const index = require(__dirname + '/../index.js');
const assert = require(__dirname + '/../lib/assert.js');
const BufferStream = require(__dirname + '/../lib/buffer-stream.js');
const GrowableBuffer = require(__dirname + '/../lib/growable-buffer.js');
const io = index;
const r = index;
const ReplaceStream = require(__dirname + '/../lib/replace-stream.js');
const Simultaneity = require(__dirname + '/../lib/simultaneity.js');
const t = index;
const util = require(__dirname + '/../lib/util-inspect.js');

let asyncErrors = 0;
fs.readdir(__dirname, (err, testSuites) => {
	if (err) throw err;
	let passed = 0;
	let total = 0;
	for (let testSuite of testSuites) {
		let dir = __dirname + '/' + testSuite;
		fs.readdir(dir, (err, tests) => {
			if (!err) {
				for (let test of tests) {
					let file = dir + '/' + test;
					fs.readFile(file, (err, data) => {
						if (err) throw err;
						total++;
						try {
							eval(data.toString());
							passed++;
						}
						catch (e) {
							console.log('Error in test file ' + file);
							console.log(e);
						}
					});
				}
			}
		});
	}
	process.on('exit', () => {
		console.log(String(passed) + ' (synchronous parts of) tests out of ' + String(total) + ' passed (' + Math.round(passed / total * 100) + '%)');
		process.exitCode = total - passed + asyncErrors;
	}).on('uncaughtException', (err) => {
		console.log('Error occurred in async test:');
		console.log(err);
		Simultaneity.endAll();
		asyncErrors++;
	});
});