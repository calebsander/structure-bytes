import {Readable} from 'stream'

/**
 * An ugly way of creating a readable stream
 * with the given contents.
 * Used for testing purposes only.
 */
export default class BufferStream extends Readable {
	constructor(buffer: ArrayBuffer) {
		super()
		this._read = () => {}
		this.push(Buffer.from(buffer))
		this.push(null)
	}
}