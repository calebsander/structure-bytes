import * as base64 from 'base64-js'
import {sha256} from 'js-sha256'
import {VERSION_STRING} from '../config'
import assert from '../lib/assert'
import {REPEATED_TYPE} from '../lib/constants'
import * as flexInt from '../lib/flex-int'
import GrowableBuffer from '../lib/growable-buffer'
import * as recursiveNesting from '../lib/recursive-nesting'
import Type from './type'

export default abstract class AbstractType<VALUE> implements Type<VALUE> {
	private cachedBuffer?: ArrayBuffer
	private cachedHash?: string
	private cachedSignature?: string
	private cachedTypeLocations?: Map<GrowableBuffer, number>

	/**
	 * Returns an unsigned byte value unique to this type class;
	 * used to serialize the type
	 */
	static get _value(): number {
		throw new Error('Generic Type has no value byte')
	}
	addToBuffer(buffer: GrowableBuffer) {
		assert.instanceOf(buffer, GrowableBuffer)
		if (this.cachedTypeLocations) { //only bother checking if type has already been written if there are cached locations
			if (!recursiveNesting.get(buffer)) { //avoid referencing types that are ancestors of a recursive type because it creates infinite recursion on read
				const location = this.cachedTypeLocations.get(buffer)
				if (location !== undefined) { //if type has already been written to this buffer, can create a pointer to it
					buffer.add(REPEATED_TYPE)
					buffer.addAll(flexInt.makeValueBuffer(buffer.length - location))
					return false
				}
			}
		}
		else this.cachedTypeLocations = new Map
		this.cachedTypeLocations.set(buffer, buffer.length) //future uses of this type will be able to point to this position in the buffer
		buffer.add((this.constructor as typeof AbstractType)._value)
		return true
	}
	toBuffer() {
		if (!this.cachedBuffer) this.cachedBuffer = this._toBuffer()
		return this.cachedBuffer
	}
	getHash() {
		if (!this.cachedHash) this.cachedHash = this._getHash()
		return this.cachedHash
	}
	getSignature() {
		if (!this.cachedSignature) this.cachedSignature = this._getSignature()
		return this.cachedSignature
	}
	abstract writeValue(buffer: GrowableBuffer, value: VALUE, root?: boolean): void
	valueBuffer(value: VALUE) {
		const buffer = new GrowableBuffer
		this.writeValue(buffer, value)
		return buffer.toBuffer()
	}
	/*
		For types that don't take any parameters, this is a sufficient equality check
		Could also implement this by checking whether the 2 types' binary representations match,
		but it is faster if we short-circuit when any fields don't match
	*/
	equals(otherType: any) {
		//Checks that otherType is not null or undefined, so constructor property exists
		if (!otherType) return false
		//Other type must have the same constructor
		try { assert.equal(otherType.constructor, this.constructor) }
		catch (e) { return false }
		return true
	}
	/**
	 * Generates the type buffer, recomputed each time
	 * @private
	 * @see Type#toBuffer
	 * @return {external:ArrayBuffer} A Buffer containing the type bytes
	 */
	private _toBuffer(): ArrayBuffer {
		const buffer = new GrowableBuffer
		this.addToBuffer(buffer)
		return buffer.toBuffer()
	}
	/**
	 * Gets an SHA256 hash of the type, recomputed each time
	 * @private
	 * @see Type#getHash
	 * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
	 */
	private _getHash(): string {
		const hash = sha256.create()
		hash.update(this.toBuffer())
		const bytes = new Uint8Array(hash.arrayBuffer())
		return base64.fromByteArray(bytes)
	}
	/**
	 * Gets a signature string for the type, recomputed each time
	 * @private
	 * @see Type#getSignature
	 * @return {string} a signature for the type
	 */
	private _getSignature(): string {
		return VERSION_STRING + this.getHash()
	}
}