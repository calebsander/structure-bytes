import * as crypto from 'crypto'
import assert from '../../dist/lib/assert'
import sha256, {sha256JS, sha256WASM} from '../../dist/lib/sha-256'

function toBytes(str: string): ArrayBuffer {
	return new Uint8Array([...str].map(c => c.charCodeAt(0))).buffer
}
const toHexString = (buffer: ArrayBuffer): string =>
	[...new Uint8Array(buffer)]
		.map(b => (b < 16 ? '0' : '') + b.toString(16))
		.join('')
export = () => {
	assert(sha256 === sha256WASM, 'No WebAssembly support')
	const TEST_CASES: [string, string][] = [
		['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
		['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
		['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq', '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'],
		['abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu', 'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1'],
		['a'.repeat(1e7), '01f4a87c04b40af59aadc0e812293509709c9a8763a60b7f9e19303322f8b03c']
	]
	for (let length = 0; length <= 1000; length++) {
		const message = new Uint8Array(length)
		for (let byte = 0; byte < length; byte++) message[byte] = Math.random() * 0x100
		const hash = crypto.createHash('sha256')
		hash.update(message as any)
		TEST_CASES.push([String.fromCharCode(...message), hash.digest('hex')])
	}
	for (const [input, output] of TEST_CASES) {
		const inputBytes = toBytes(input)
		for (const f of [sha256, sha256JS, sha256WASM!]) {
			assert.equal(toHexString(f(inputBytes)), output)
		}
	}
}