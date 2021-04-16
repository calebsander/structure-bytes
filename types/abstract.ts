import * as base64 from 'base64-js'
import sha256 from '../lib/sha-256'
import {VERSION_STRING} from '../config'
import {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {REPEATED_TYPE} from '../lib/constants'
import * as flexInt from '../lib/flex-int'
import GrowableBuffer, {asUint8Array, toArrayBuffer} from '../lib/growable-buffer'
import type {ReadResult} from '../lib/read-util'
import * as recursiveNesting from '../lib/recursive-nesting'
import type {Type} from './type'

/**
 * The superclass of all [[Type]] classes
 * in this package
 */
export default abstract class AbstractType<VALUE, READ_VALUE extends VALUE = VALUE> implements Type<VALUE, READ_VALUE> {
	private cachedBuffer?: ArrayBuffer
	private cachedHash?: string
	private cachedSignature?: string
	private cachedTypeLocations?: WeakMap<AppendableBuffer, number>

	/**
	 * Returns an unsigned byte value unique to this type class;
	 * used to serialize the type
	 */
	static get _value(): number {
		throw new Error('Generic Type has no value byte')
	}
	addToBuffer(buffer: AppendableBuffer): boolean {
		this.isBuffer(buffer)
		if (this.cachedTypeLocations) { //only bother checking if type has already been written if there are cached locations
			if (!recursiveNesting.get(buffer)) { //avoid referencing types that are ancestors of a recursive type because it creates infinite recursion on read
				const location = this.cachedTypeLocations.get(buffer)
				if (location !== undefined) { //if type has already been written to this buffer, can create a pointer to it
					// TODO: use most recent location
					buffer
						.add(REPEATED_TYPE)
						.addAll(flexInt.makeValueBuffer(buffer.length - location))
					return false
				}
			}
		}
		else this.cachedTypeLocations = new WeakMap
		this.cachedTypeLocations.set(buffer, buffer.length) //future uses of this type will be able to point to this position in the buffer
		buffer.add((this.constructor as typeof AbstractType)._value)
		return true
	}
	toBuffer(): ArrayBuffer {
		if (!this.cachedBuffer) this.cachedBuffer = this._toBuffer()
		if (this.cachedBuffer instanceof Uint8Array) {
			this.cachedBuffer = toArrayBuffer(this.cachedBuffer)
		}
		return this.cachedBuffer
	}
	getHash(): string {
		if (!this.cachedHash) this.cachedHash = this._getHash()
		return this.cachedHash
	}
	getSignature(): string {
		if (!this.cachedSignature) this.cachedSignature = this._getSignature()
		return this.cachedSignature
	}
	abstract writeValue(buffer: AppendableBuffer, value: VALUE): void
	valueBuffer(value: VALUE): ArrayBuffer {
		const buffer = new GrowableBuffer
		this.writeValue(buffer, value)
		return buffer.toBuffer()
	}
	abstract consumeValue(buffer: ArrayBuffer, offset: number, baseValue?: unknown): ReadResult<READ_VALUE>
	readValue(valueBuffer: ArrayBuffer | Uint8Array, offset = 0): READ_VALUE {
		assert.instanceOf(valueBuffer, [ArrayBuffer, Uint8Array])
		assert.instanceOf(offset, Number)
		const {buffer, byteOffset, byteLength} = asUint8Array(valueBuffer)
		const {value, length} = this.consumeValue(buffer, byteOffset + offset)
		if (offset + length !== byteLength) {
			throw new Error('Did not consume all of buffer')
		}
		return value
	}
	/*
		For types that don't take any parameters, this is a sufficient equality check
		Could also implement this by checking whether the 2 types' binary representations match,
		but it is faster if we short-circuit when any fields don't match
	*/
	equals(otherType: unknown): boolean {
		return this.isSameType(otherType)
	}
	/**
	 * Determines whether the input is a Type with the same class
	 * @private
	 * @param otherType A value, usually a Type instance
	 * @returns whether `this` and `otherType` are instances of the same Type class
	 */
	protected isSameType(otherType: unknown): otherType is this {
		//Check that otherType is not null or undefined, so constructor property exists.
		//Then check that other type has the same constructor.
		//eslint-disable-next-line @typescript-eslint/ban-types
		return !!otherType && this.constructor === (otherType as object).constructor
	}
	/**
	 * Requires that the buffer be a [[GrowableBuffer]]
	 * or [[AppendableStream]]
	 * @private
	 * @param buffer The value to assert is an [[AppendableBuffer]]
	 */
	protected isBuffer(buffer: AppendableBuffer): void {
		assert.instanceOf(buffer, AppendableBuffer)
	}
	/**
	 * Generates the type buffer, recomputed each time
	 * @private
	 * @return An `ArrayBuffer` containing the type bytes
	 */
	private _toBuffer(): Uint8Array {
		const buffer = new GrowableBuffer
		this.addToBuffer(buffer)
		return buffer.toUint8Array()
	}
	/**
	 * Gets an SHA256 hash of the type, recomputed each time
	 * @private
	 * @return A hash of the buffer given by [[toBuffer]]
	 */
	private _getHash(): string {
		if (!this.cachedBuffer) this.cachedBuffer = this._toBuffer()
		return base64.fromByteArray(new Uint8Array(sha256(asUint8Array(this.cachedBuffer))))
	}
	/**
	 * Gets a signature string for the type, recomputed each time,
	 * based on the `structure-bytes` protocol version and the type hash
	 * @private
	 * @return A signature for the type
	 */
	private _getSignature(): string {
		return VERSION_STRING + this.getHash()
	}
}