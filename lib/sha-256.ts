import {timesEight} from './bit-math'
import sha256Module from './sha256-load'

interface WasmExports {
	INPUT_START: number | (WebAssembly.Global & {value: number})
	memory: WebAssembly.Memory
	fitInput(length: number): void
	sha256(length: number): void
}

const K = new Uint32Array([
	0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
	0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
	0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
	0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
	0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
	0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
	0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
	0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
])

const rightRotate = (value: number, bits: number): number =>
	(value >>> bits) | (value << (32 - bits))

export function sha256JS(input: Uint8Array) {
	const lBytes = input.length
	const extraBytes = 64 - ((lBytes + 72) & 63)
	const messageLength = lBytes + extraBytes + 8
	const message = new ArrayBuffer(messageLength)
	const castMessage = new Uint8Array(message)
	castMessage.set(input)
	castMessage[lBytes] = 1 << 7
	new DataView(message).setUint32(messageLength - 4, timesEight(lBytes))

	const hash = new Uint32Array([
		0x6a09e667,
		0xbb67ae85,
		0x3c6ef372,
		0xa54ff53a,
		0x510e527f,
		0x9b05688c,
		0x1f83d9ab,
		0x5be0cd19
	])
	for (let chunkStart = 0; chunkStart < messageLength; chunkStart += 64) {
		const w = new Uint32Array(64)
		const chunkDataView = new DataView(message, chunkStart, 64)
		for (let i = 0; i < 16; i++) w[i] = chunkDataView.getUint32(i << 2)
		for (let i = 16; i < 64; i++) {
			const wMinus15 = w[i - 15]
			const s0 = rightRotate(wMinus15, 7) ^ rightRotate(wMinus15, 18) ^ (wMinus15 >>> 3)
			const wMinus2 = w[i - 2]
			const s1 = rightRotate(wMinus2, 17) ^ rightRotate(wMinus2, 19) ^ (wMinus2 >>> 10)
			w[i] = w[i - 16] + s0 + w[i - 7] + s1
		}
		let [a, b, c, d, e, f, g, h] = hash
		for (let i = 0; i < 64; i++) {
			const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
			const ch = (e & f) ^ (~e & g)
			const temp1 = h + S1 + ch + K[i] + w[i]
			const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
			const maj = (a & b) ^ (a & c) ^ (b & c)
			const temp2 = S0 + maj
			h = g; g = f; f = e
			e = d + temp1
			d = c; c = b; b = a
			a = temp1 + temp2
		}
		hash[0] += a
		hash[1] += b
		hash[2] += c
		hash[3] += d
		hash[4] += e
		hash[5] += f
		hash[6] += g
		hash[7] += h
	}
	const result = new ArrayBuffer(32)
	const resultDataView = new DataView(result)
	for (let i = 0; i < 8; i++) resultDataView.setUint32(i << 2, hash[i])
	return result
}
export const sha256Wasm: typeof sha256JS | undefined = (() => {
	if (!sha256Module) return undefined

	const {exports} = sha256Module
	const {INPUT_START, fitInput, memory, sha256} = exports as unknown as WasmExports
	const inputStart: number = INPUT_START.valueOf()
	return (input: Uint8Array) => {
		const {length} = input
		fitInput(length)
		const {buffer} = memory
		new Uint8Array(buffer).set(input, inputStart)
		sha256(length)
		return buffer.slice(0, 32)
	}
})()
/**
 * Computes a SHA-256 hash of the binary data,
 * output as an `ArrayBuffer`.
 * Implementation details mostly copied from
 * [Wikipedia](https://en.wikipedia.org/wiki/SHA-2#Pseudocode).
 * @param input The input data
 */
export default sha256Wasm || sha256JS