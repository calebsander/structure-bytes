import * as crypto from 'crypto'
import assert from '../../dist/lib/assert'
import sha256 from '../../dist/lib/sha-256'

function toBytes(str: string): ArrayBuffer {
	return new Uint8Array(Array.from(str).map(c => c.charCodeAt(0))).buffer
}
function toHexString(buffer: ArrayBuffer): string {
	let result = ''
	for (const b of new Uint8Array(buffer)) {
		if (b < 16) result += '0'
		result += b.toString(16)
	}
	return result
}
export = () => {
	const TEST_CASES: [string, string][] = [
		['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
		['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
		['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq', '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'],
		['abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu', 'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1'],
		['a'.repeat(1e6), 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0']
	]
	for (let length = 0; length <= 1000; length++) {
		const message = new Uint8Array(length)
		for (let byte = 0; byte < length; byte++) message[byte] = Math.random() * 0x100
		const hash = crypto.createHash('sha256')
		hash.update(message as any)
		TEST_CASES.push([String.fromCharCode(...message), hash.digest('hex')])
	}
	for (const [input, output] of TEST_CASES) assert.equal(toHexString(sha256(toBytes(input))), output)
}