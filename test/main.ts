#!/usr/bin/env node
/*eslint-disable no-console*/
import * as fs from 'fs'
import {promisify} from 'util'

promisify(fs.readdir)(__dirname)
	.then(testSuites => {
		let passed = 0
		let total = 0
		let asyncErrors = 0
		function success() {
			passed++
		}
		function testFile(dir: string, test: string) {
			const file = dir + '/' + test
			total++
			function error(err: Error) {
				console.error('Error in test file ' + file)
				console.error(err)
			}
			const runTest = require(file)
			if (runTest instanceof Promise) {
				runTest
					.then(success)
					.catch(error)
			}
			else {
				try {
					(runTest as () => void)()
					success()
				}
				catch (e) {
					error(e)
				}
			}
		}
		Promise.all(
			testSuites
				.filter(suite => suite.indexOf('.') === -1)
				.map(testSuite => {
					const dir = __dirname + '/' + testSuite
					return promisify(fs.readdir)(dir)
						.then(tests => {
							for (const test of tests.filter(test => test.endsWith('.ts'))) {
								testFile(dir, test.replace('.ts', '.js'))
							}
						})
						.catch(err => {})
					})
		)
			.then(() => {
				if (!process.argv[2]) require('../compile') //if another argument is specified, don't compile
			})
		process
			.on('exit', () => {
				console.log(
					String(passed) +
					' (synchronous parts of) tests out of ' +
					String(total) +
					' passed (' +
					Math.round(passed / total * 100) +
					'%)'
				)
				process.exitCode = (total - passed) + asyncErrors
			})
			.on('uncaughtException', err => {
				console.error('Error occurred in async test:')
				console.log(err)
				asyncErrors++
			})
	})
	.catch(err => {
		throw err
	})