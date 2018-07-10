#!/usr/bin/env node

const fs = require('fs')
const base64 = require('base64-js')

const [,, filenamePrefix] = process.argv
const wasm = fs.readFileSync(filenamePrefix + '.wasm')
const outStream = fs.createWriteStream(filenamePrefix + '-load.ts')
outStream.write(`import * as base64 from 'base64-js'

//tslint:disable-next-line:strict-type-predicates
export default typeof WebAssembly === 'undefined'
	? undefined
	: new WebAssembly.Instance(
			new WebAssembly.Module(
				//tslint:disable-next-line:max-line-length
				base64.toByteArray('${base64.fromByteArray(wasm)}')
			)
		)`)
outStream.end()