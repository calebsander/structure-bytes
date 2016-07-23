/* eslint-disable no-unused-vars, no-console*/
//For this file
const fs = require('fs');
const path = require('path');

//For tests
const index = require(__dirname + '/../index.js');
const assert = require(__dirname + '/../lib/assert.js');
const BufferStream = require(__dirname + '/../lib/buffer-stream.js');
const GrowableBuffer = require(__dirname + '/../lib/growable-buffer.js');
const io = index;
const r = index.r;
const ReplaceStream = require(__dirname + '/../lib/replace-stream.js');
const Simultaneity = require(__dirname + '/../lib/simultaneity.js');
const t = index;
const util = require(__dirname + '/../lib/util-inspect.js');

let asyncErrors = 0;
fs.readdir(__dirname, (err, testSuites) => {
	if (err) throw err;
	const suitesS = new Simultaneity;
	const testsS = new Simultaneity;
	let passed = 0;
	let total = 0;
	function testFile(dir, test) {
		const file = dir + '/' + test;
		fs.readFile(file, (err, data) => {
			if (err) throw err;
			total++;
			try {
				eval(data
					.toString()
					.replace(/__dirname/g, "'" + dir.replace(/\\/g, '/') + "'") //otherwise __dirname refers to this file
				);
				passed++;
			}
			catch (e) {
				console.log('Error in test file ' + file);
				console.log(e);
			}
			testsS.taskFinished();
		});
	}
	for (let testSuite of testSuites) {
		suitesS.addTask(() => {
			const dir = __dirname + '/' + testSuite;
			fs.readdir(dir, (err, tests) => {
				if (!err) {
					for (let test of tests) {
						testsS.addTask(() => {
							testFile(dir, test);
						});
					}
				}
				suitesS.taskFinished();
			});
		});
	}
	suitesS.callback(() => { //wait until all suites have been scanned to run tests
		testsS.callback(() => require(__dirname + '/../compile.js')); //not run as a test so that coverage is generated
	});
	process.on('exit', () => {
		console.log(
			String(passed) +
			' (synchronous parts of) tests out of ' +
			String(total) +
			' passed (' +
			Math.round(passed / total * 100) +
			'%)'
		);
		process.exitCode = total - passed + asyncErrors
	}).on('uncaughtException', (err) => {
		console.log('Error occurred in async test:');
		console.log(err);
		Simultaneity.endAll();
		asyncErrors++;
	});
});