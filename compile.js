#!/usr/bin/env node
/*eslint-disable no-console, camelcase*/
const browserify = require('browserify')
const ClosureCompiler = require('google-closure-compiler').compiler
const fs = require('fs')
const path = require('path')
const Simultaneity = require('simultaneity')

const uploadB = browserify()
uploadB.add(path.join(__dirname, 'client-side/upload.js'))
const downloadB = browserify()
downloadB.add(path.join(__dirname, 'client-side/download.js'))
const uploadDownloadB = browserify()
uploadDownloadB.add(path.join(__dirname, 'client-side/upload-download.js'))

const UPLOAD_FILES = [
	'./client-side/binary-ajax.js',
	'./client-side/common.js',
	'./config.js',
	'./lib/assert.js',
	'./lib/bit-math.js',
	'./lib/buffer-string.js',
	'./lib/flex-int.js',
	'./lib/growable-buffer.js',
	'./lib/strint.js',
	'./recursive-registry.js',
	'./structure-types.js'
]
const DOWNLOAD_FILES = UPLOAD_FILES.concat([
	'./constructor-registry.js',
	'./read.js'
])
function initiateCompile() {
	//Include a file in the browserify result because it is require()d by other files
	function exposeFile(b, fileName) {
		b.require(fileName, {expose: fileName})
	}
	function compile(b, {exposeFiles, outputFile}) {
		console.log('Compiling: Browserifying ' + outputFile)
		const absoluteOutputFile = path.join(__dirname, outputFile)
		for (const file of exposeFiles) exposeFile(b, file)
		const bundleOutputFile = absoluteOutputFile.replace(/.js$/, '-unminified.js')
		b.bundle().pipe(fs.createWriteStream(bundleOutputFile))
			.on('finish', () => {
				console.log('Compiling: Minifying ' + outputFile)
				new ClosureCompiler({
					js: [bundleOutputFile],
					js_output_file: absoluteOutputFile,
					output_wrapper: '!function(){%output%}()',
					language_out: 'ES5',
					jscomp_off: '*' //browserify generates some ugly code that can be ignored
				}).run((exitCode, stdOut, stdErr) => {
					stdOut = stdOut.trim()
					if (stdOut) console.log(stdOut)
					stdErr = stdErr.trim()
					if (stdErr) console.error(stdErr)
				})
			})
	}
	compile(uploadB, {
		exposeFiles: UPLOAD_FILES,
		outputFile: 'compiled/upload.js'
	})
	compile(downloadB, {
		exposeFiles: DOWNLOAD_FILES,
		outputFile: 'compiled/download.js'
	})
	compile(uploadDownloadB, {
		exposeFiles: DOWNLOAD_FILES,
		outputFile: 'compiled/upload-download.js'
	})
}

//Load the upload and download code and append them to each other to make a combined include file
//These files are not too big, so it is not terrible to load them into memory
let uploadCode, downloadCode
new Simultaneity()
	.addTask(s => {
		fs.readFile(path.join(__dirname, 'client-side/upload.js'), (err, data) => {
			if (err) throw err
			uploadCode = data
			s.taskFinished()
		})
	})
	.addTask(s => {
		fs.readFile(path.join(__dirname, 'client-side/download.js'), (err, data) => {
			if (err) throw err
			downloadCode = data
			s.taskFinished()
		})
	})
	.callback(() => {
		fs.writeFile(
			path.join(__dirname, 'client-side/upload-download.js'),
			Buffer.concat([uploadCode, Buffer.from(';'), downloadCode]),
			err => {
				if (err) throw err
				initiateCompile()
			}
		)
	})