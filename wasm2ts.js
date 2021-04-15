#!/usr/bin/env node

const fs = require('fs').promises
const base64 = require('base64-js')

const filenamePrefix = process.argv[2]

async function generateWasmLoader(filenamePrefix) {
	const wasm = await fs.readFile(filenamePrefix + '.wasm')
	await fs.writeFile(
		filenamePrefix + '-load.ts',
`import * as base64 from 'base64-js'

export default typeof WebAssembly === 'undefined'
	? undefined
	: new WebAssembly.Instance(
		new WebAssembly.Module(
			base64.toByteArray('${base64.fromByteArray(wasm)}')
		)
	)`
	)
}

generateWasmLoader(filenamePrefix)