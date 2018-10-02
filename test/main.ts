#!/usr/bin/env node

import * as fs from 'fs'
import {promisify} from 'util'

let passed = 0, total = 0, asyncErrors = 0
function success() {
	passed++
}
process
	.on('uncaughtException', err => {
		console.error('Error occurred in async test:')
		console.error(err)
		asyncErrors++
	})
	.on('exit', _ => {
		console.log(
			`${passed} tests out of ${total} passed (${Math.round(passed / total * 100)}%)`
		)
		process.exitCode = (total - passed) + asyncErrors
	})
promisify(fs.readdir)(__dirname)
	.then(testSuites => {
		function testFile(dir: string, test: string): Promise<void> {
			const file = dir + '/' + test
			total++
			function error(err: Error) {
				console.error('Error in test file', file)
				console.error(err)
			}
			let runTest: Promise<void> | (() => void)
			try { runTest = require(file) }
			catch (e) {
				error(e)
				return Promise.resolve()
			}
			if (runTest instanceof Promise) {
				return runTest.then(success, error)
			}
			else {
				try {
					runTest()
					success()
				}
				catch (e) { error(e) }
				return Promise.resolve()
			}
		}
		return Promise.all(
			testSuites
				.filter(suite => !suite.includes('.'))
				.map(testSuite => {
					const dir = __dirname + '/' + testSuite
					return promisify(fs.readdir)(dir)
						.then(tests => Promise.all(tests
							.filter(test => test.endsWith('.ts'))
							.map(test => testFile(dir, test.replace('.ts', '.js')))
						))
						.catch(err => { throw err })
					})
		)
	})
	.catch(err => { throw err })