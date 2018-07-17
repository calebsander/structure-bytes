#!/usr/bin/env node

const fs = require('fs')
const {promisify} = require('util')
const base64 = require('base64-js')

const filenamePrefix = process.argv[2]
promisify(fs.readFile)(filenamePrefix + '.wasm')
	.then(wasm =>
		promisify(fs.writeFile)(
			filenamePrefix + '-load.ts',
			`import * as base64 from 'base64-js'

//tslint:disable-next-line:strict-type-predicates
export default typeof WebAssembly === 'undefined'
	? undefined
	: new WebAssembly.Instance(
			new WebAssembly.Module(
				//tslint:disable-next-line:max-line-length
				base64.toByteArray('${base64.fromByteArray(wasm)}')
			)
		)`
		)
	)
	.catch(err => { throw err })