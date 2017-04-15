#!/usr/bin/env node
/*eslint-disable no-unused-vars, no-console*/
//For this file
const fs = require('fs')

//For tests
const index = require('../index')
const assert = require('../lib/assert')
const BufferStream = require('../lib/buffer-stream')
const constructorRegistry = require('../constructor-registry')
const bufferString = require('../lib/buffer-string')
const GrowableBuffer = require('../lib/growable-buffer')
const io = index
const {r} = index
const rec = index
const ReplaceStream = require('../lib/replace-stream')
const Simultaneity = require('simultaneity')
const t = index
const util = require('../lib/util-inspect.js')
function bufferFrom(bytes) {
	const buffer = new ArrayBuffer(bytes.length)
	new Uint8Array(buffer).set(bytes)
	return buffer
}
function bufferFill(length, value) {
	const buffer = new ArrayBuffer(length)
	new Uint8Array(buffer).fill(value)
	return buffer
}
function concat(buffers) {
	const gb = new GrowableBuffer
	for (const buffer of buffers) gb.addAll(buffer)
	return gb.toBuffer()
}

let asyncErrors = 0
fs.readdir(__dirname, (err, testSuites) => {
	if (err) throw err
	const suitesS = new Simultaneity
	const testsS = new Simultaneity
	let passed = 0
	let total = 0
	function testFile(dir, test, s) {
		const file = dir + '/' + test
		fs.readFile(file, (err, data) => {
			if (err) throw err
			total++
			try {
				eval(data
					.toString()
					.replace(/__dirname/g, "'" + dir.replace(/\\/g, '/') + "'") //otherwise __dirname refers to this file
				)
				passed++
			}
			catch (e) {
				console.error('Error in test file ' + file)
				console.error(e)
			}
			s.taskFinished()
		})
	}
	for (const testSuite of testSuites) {
		suitesS.addTask(s => {
			const dir = __dirname + '/' + testSuite
			fs.readdir(dir, (err, tests) => {
				if (!err) {
					for (const test of tests) testsS.addTask(s => testFile(dir, test, s))
				}
				s.taskFinished()
			})
		})
	}
	suitesS.callback(() => { //wait until all suites have been scanned to run tests
		if (process.argv[2]) testsS.callback(() => {}) //if another argument is specified, don't compile
		else testsS.callback(() => require('../compile')) //not run as a test so that coverage is generated
	})
	process.on('exit', () => {
		console.log(
			String(passed) +
			' (synchronous parts of) tests out of ' +
			String(total) +
			' passed (' +
			Math.round(passed / total * 100) +
			'%)'
		)
		process.exitCode = total - passed + asyncErrors
	}).on('uncaughtException', err => {
		console.error('Error occurred in async test:')
		console.error(err)
		Simultaneity.endAll()
		asyncErrors++
	})
})