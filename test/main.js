const fs = require('fs');

const assert = require(__dirname + '/../lib/assert.js');
const BufferStream = require(__dirname + '/../lib/buffer-stream.js');
const GrowableBuffer = require(__dirname + '/../lib/growable-buffer.js');
const io = require(__dirname + '/../io.js');
const r = require(__dirname + '/../read.js');
const t = require(__dirname + '/../structure-types.js');

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
		console.log(String(passed) + ' tests out of ' + String(total) + ' passed (' + Math.round(passed / total * 100) + '%)');
		process.exitCode = total - passed;
	});
});