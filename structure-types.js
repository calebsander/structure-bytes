//For use with browserify
if (__dirname === '/') __dirname = '';

const assert = require(__dirname + '/lib/assert.js');
const config = require(__dirname + '/config.js');
const createHash = require('sha.js');
const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js');
const strint = require(__dirname + '/lib/strint.js');
const util = require('util');
const {dividedByEight, modEight} = require(__dirname + '/lib/bit-math.js');

//Since most things with length store it in a 32-bit unsigned integer,
//this utility function makes the creation of that buffer easier
function lengthBuffer(length) {
	const buffer = Buffer.allocUnsafe(4);
	buffer.writeUInt32BE(length, 0);
	return buffer;
}
const BINARY = 'binary';
//After writing all the values, it is necessary to insert all the values of pointer types
function setPointers(buffer, root) {
	if (root) { //ensure this only happens once
		if (buffer.pointers) {
			for (let [bufferString, insertionIndices] of buffer.pointers) {
				const index = buffer.length;
				buffer.addAll(Buffer.from(bufferString, BINARY));
				const indexBuffer = Buffer.allocUnsafe(4);
				indexBuffer.writeUInt32BE(index);
				for (let insertionIndex of insertionIndices) buffer.setAll(insertionIndex, indexBuffer);
			}
		}
	}
}

const REPEATED_TYPE = 0xFF; //type byte indicating next 2 bytes are an unsigned short containing the location of the type

/**
 * The superclass of each class representing a possible type.
 * This class should only be used to check if an object is a valid type.
 */
class Type {
	/**
	 * The type byte that uniquely identifies a type.
	 * Accessing this will throw an error on the {@link Type} class.
	 * @readonly
	 * @type {number}
	 */
	static get _value() {
		throw new Error('Generic Type has no value byte');
	}
	/**
	 * Appends the type information to a {@link GrowableBuffer}.
	 * All types start with the byte specified by {@link Type._value}.
	 * For the most primitive types, this implementation is sufficient.
	 * Recursive types should override this method,
	 * invoking [super.addToBuffer()]{@link Type#addToBuffer} and then adding their own data if it returns true.
	 * @param {GrowableBuffer} buffer The buffer to append to
	 * @return {boolean} {@link false} if it wrote a pointer to a previous instance, {@link true} if it wrote the type byte. Intended to only be used internally.
	 */
	addToBuffer(buffer) {
		assert.instanceOf(buffer, GrowableBuffer);
		if (this.cachedTypeLocations) {
			const location = this.cachedTypeLocations.get(buffer);
			if (location !== undefined) { //if type has already been written to this buffer, can create a pointer to it
				buffer.add(REPEATED_TYPE);
				const offsetBuffer = Buffer.allocUnsafe(2);
				try { //error will be thrown if offset didn't fit in a 2-byte integer, so fall through to explicitly writing the bytes
					offsetBuffer.writeUInt16BE(buffer.length - location, 0);
					buffer.addAll(offsetBuffer);
					return false;
				}
				catch (e) {} //eslint-disable-line no-empty
			}
		}
		else this.cachedTypeLocations = new Map;
		this.cachedTypeLocations.set(buffer, buffer.length);
		buffer.add(this.constructor._value);
		return true;
	}
	/**
	 * Gets the type in buffer form, using a cached value if present.
	 * Since types are immutable, the result should never change from the cached value.
	 * @return {external:Buffer} A Buffer containing the type bytes
	 */
	toBuffer() {
		if (!this.cachedBuffer) this.cachedBuffer = this._toBuffer();
		return this.cachedBuffer;
	}
	/**
	 * Generates the type buffer, recomputed each time
	 * @private
	 * @see Type#toBuffer
	 * @return {external:Buffer} A Buffer containing the type bytes
	 */
	_toBuffer() {
		const buffer = new GrowableBuffer;
		this.addToBuffer(buffer);
		return buffer.toBuffer();
	}
	/**
	 * Gets an SHA256 hash of the type, using a cached value if present
	 * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
	 */
	getHash() {
		if (!this.cachedHash) this.cachedHash = this._getHash();
		return this.cachedHash;
	}
	/**
	 * Gets an SHA256 hash of the type, recomputed each time
	 * @private
	 * @see Type#getHash
	 * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
	 */
	_getHash() {
		const hash = createHash('sha256');
		hash.update(this.toBuffer());
		return hash.digest('base64');
	}
	/**
	 * Gets a signature string for the type, using a cached value if present.
	 * This string encodes the specification version and the type hash.
	 * @return {string} a signature for the type
	 */
	getSignature() {
		if (!this.cachedSignature) this.cachedSignature = this._getSignature();
		return this.cachedSignature;
	}
	/**
	 * Gets a signature string for the type, recomputed each time
	 * @private
	 * @see Type#getSignature
	 * @return {string} a signature for the type
	 */
	_getSignature() {
		return config.VERSION_STRING + this.getHash();
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @abstract
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param value The value to write
	 * @throws {Error} If called on the {@link Type} class
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) { //eslint-disable-line no-unused-vars
		throw new Error('Generic Type has no value representation');
	}
	/**
	 * Gets a {@link Buffer} containing the value in binary format.
	 * See this type's {@link writeValue()} documentation
	 * for acceptable values.
	 * @param value The value to write
	 * @return {external:Buffer} a {@link Buffer} storing the value (assuming the type is known)
	 * @see Type#writeValue
	 */
	valueBuffer(value) {
		const buffer = new GrowableBuffer;
		this.writeValue(buffer, value);
		return buffer.toBuffer();
	}
	/**
	 * Returns whether this type object represents the same type as another object
	 * @param {Type} otherType Another object to compare with
	 * @return {boolean} {@link true} iff the types have the same constructor and the same field values for fields not starting with {@link 'cached'}
	 */
	equals(otherType) {
		try { assert.instanceOf(otherType, this.constructor) } //eslint-disable-line semi
		catch (e) { return false } //eslint-disable-line semi
		try { assert.equal(otherType.constructor, this.constructor) } //eslint-disable-line semi
		catch (e) { return false } //eslint-disable-line semi
		for (let param in this) {
			if (this.hasOwnProperty(param) && !param.startsWith('cached')) {
				try { assert.equal(otherType[param], this[param]) } //eslint-disable-line semi
				catch (e) { return false } //eslint-disable-line semi
			}
		}
		return true;
	}
}

/**
 * A type that is not a {@link PointerType}.
 * Used internally to disallow creating double pointers.
 * @private
*/
class AbsoluteType extends Type {}

/**
 * A type storing an signed integer
 * @private
 */
class IntegerType extends AbsoluteType {}
/**
 * A type storing a 1-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class ByteType extends IntegerType {
	static get _value() {
		return 0x01;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(1);
		byteBuffer.writeInt8(value, 0);
		buffer.addAll(byteBuffer);
	}
}
/**
 * A type storing a 2-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class ShortType extends IntegerType {
	static get _value() {
		return 0x02;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(2);
		byteBuffer.writeInt16BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
/**
 * A type storing a 4-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class IntType extends IntegerType {
	static get _value() {
		return 0x03;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(4);
		byteBuffer.writeInt32BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
/**
 * A type storing an 8-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class LongType extends IntegerType {
	static get _value() {
		return 0x04;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, String);
		if (strint.gt(value, '9223372036854775807') || strint.lt(value, '-9223372036854775808')) throw new Error('Value out of range');
		const upper = strint.div(value, strint.LONG_UPPER_SHIFT, true); //get upper signed int
		const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT)); //get lower unsigned int
		const byteBuffer = Buffer.allocUnsafe(8);
		byteBuffer.writeInt32BE(Number(upper), 0);
		byteBuffer.writeUInt32BE(Number(lower), 4);
		buffer.addAll(byteBuffer);
	}
}

/**
 * A type storing an unsigned integer
 * @private
 */
class UnsignedType extends AbsoluteType {}
/**
 * A type storing a 1-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class UnsignedByteType extends UnsignedType {
	static get _value() {
		return 0x11;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(1);
		byteBuffer.writeUInt8(value, 0);
		buffer.addAll(byteBuffer);
	}
}
/**
 * A type storing a 2-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class UnsignedShortType extends UnsignedType {
	static get _value() {
		return 0x12;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(2);
		byteBuffer.writeUInt16BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
/**
 * A type storing a 4-byte signed integer
 * @extends Type
 * @inheritdoc
 */
class UnsignedIntType extends UnsignedType {
	static get _value() {
		return 0x13;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(4);
		byteBuffer.writeUInt32BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
function writeUnsignedLong(buffer, value) {
	assert.instanceOf(buffer, GrowableBuffer);
	assert.instanceOf(value, String);
	if (strint.gt(value, '18446744073709551615') || strint.lt(value, '0')) throw new Error('Value out of range');
	const upper = strint.div(value, strint.LONG_UPPER_SHIFT);
	const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT));
	const byteBuffer = Buffer.allocUnsafe(8);
	byteBuffer.writeUInt32BE(Number(upper), 0);
	byteBuffer.writeUInt32BE(Number(lower), 4);
	buffer.addAll(byteBuffer);
}
/**
 * A type storing an 8-byte unsigned integer
 * @extends Type
 * @inheritdoc
 */
class UnsignedLongType extends UnsignedType {
	static get _value() {
		return 0x14;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		writeUnsignedLong(buffer, value);
	}
}
/**
 * A type storing a {@link Date} with millisecond precision.
 * The value is stored as an 8-byte unsigned integer.
 * @extends Type
 * @inheritdoc
 */
class DateType extends AbsoluteType {
	static get _value() {
		return 0x15;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Date} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(value, Date);
		writeUnsignedLong(buffer, String(value.getTime()));
	}
}

/**
 * A type storing a [floating-point number]{@linkplain https://en.wikipedia.org/wiki/Floating_point}
 * @private
 */
class FloatingPointType extends AbsoluteType {
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
	}
}
/**
 * A type storing a 4-byte [IEEE floating point]{@linkplain https://en.wikipedia.org/wiki/IEEE_floating_point}
 * @extends Type
 * @inheritdoc
 */
class FloatType extends FloatingPointType {
	static get _value() {
		return 0x20;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		super.writeValue(buffer, value);
		const byteBuffer = Buffer.allocUnsafe(4);
		byteBuffer.writeFloatBE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
/**
 * A type storing an 8-byte [IEEE floating point]{@linkplain https://en.wikipedia.org/wiki/IEEE_floating_point}
 * @extends Type
 * @inheritdoc
 */
class DoubleType extends FloatingPointType {
	static get _value() {
		return 0x21;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		super.writeValue(buffer, value);
		const byteBuffer = Buffer.allocUnsafe(8);
		byteBuffer.writeDoubleBE(value, 0);
		buffer.addAll(byteBuffer);
	}
}

/**
 * A type storing a {@link Boolean} value (a bit)
 * @extends Type
 * @inheritdoc
 */
class BooleanType extends AbsoluteType {
	static get _value() {
		return 0x30;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {boolean} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Boolean);
		if (value) buffer.add(0xFF);
		else buffer.add(0x00);
	}
}
function writeBooleans(buffer, booleans) {
	assert.instanceOf(booleans, Array);
	const incompleteBytes = modEight(booleans.length);
	const bytes = dividedByEight(booleans.length);
	let length;
	if (incompleteBytes) length = bytes + 1;
	else length = bytes;
	const byteBuffer = Buffer.allocUnsafe(length);
	if (incompleteBytes) byteBuffer[length - 1] = 0; //clear unused bits
	for (let i = 0; i < booleans.length; i++) {
		const boolean = booleans[i];
		assert.instanceOf(boolean, Boolean);
		const bit = modEight(~modEight(i)); //7 - (i % 8)
		if (boolean) byteBuffer[dividedByEight(i)] |= 1 << bit;
		else byteBuffer[dividedByEight(i)] &= ~(1 << bit);
	}
	buffer.addAll(byteBuffer);
}
/**
 * A type storing a fixed-length array of {@link Boolean} values
 * @see BooleanType
 * @see TupleType
 * @extends Type
 * @inheritdoc
 */
class BooleanTupleType extends AbsoluteType {
	static get _value() {
		return 0x31;
	}
	/**
	 * @param {number} length The number of {@link Boolean}s in each value of this type
	 */
	constructor(length) {
		super();
		assert.fourByteUnsignedInteger(length);
		this.length = length;
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) buffer.addAll(lengthBuffer(this.length));
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Boolean[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Array);
		if (value.length !== this.length) throw new Error('Length does not match');
		writeBooleans(buffer, value);
	}
}
/**
 * A type storing a variable-length array of {@link Boolean} values
 * @see BooleanType
 * @extends Type
 * @inheritdoc
 */
class BooleanArrayType extends AbsoluteType {
	static get _value() {
		return 0x32;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Boolean[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(value, Array);
		assert.fourByteUnsignedInteger(value.length);
		buffer.addAll(lengthBuffer(value.length));
		writeBooleans(buffer, value);
	}
}

/**
 * A type storing a single UTF-8 character
 * @extends Type
 * @inheritdoc
 */
class CharType extends AbsoluteType {
	static get _value() {
		return 0x40;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write (must be only 1 character long)
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, String);
		assert.assert(value.length === 1, 'String must contain only 1 character');
		buffer.addAll(Buffer.from(value));
	}
}
/**
 * A type storing a string of UTF-8 characters, with no bound on length
 * @extends Type
 * @inheritdoc
 */
class StringType extends AbsoluteType {
	static get _value() {
		return 0x41;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, String);
		const valueBuffer = Buffer.from(value);
		buffer.addAll(valueBuffer);
		buffer.add(0);
	}
}
/**
 * A type storing an array of bytes.
 * This is intended for data, e.g. a hash, that doesn't fit any other category.
 * The number of bytes must fit in a 4-byte unsigned integer.
 * @extends Type
 * @inheritdoc
 */
class OctetsType extends AbsoluteType {
	static get _value() {
		return 0x42;
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {external:Buffer} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Buffer);
		assert.fourByteUnsignedInteger(value.length);
		buffer.addAll(lengthBuffer(value.length));
		buffer.addAll(value);
	}
}

/**
 * A type storing a fixed-length array of values of the same type.
 * The length must fit in a 4-byte unsigned integer.
 * @example
 * //For storing 5 4-byte unsigned integers
 * let type = new sb.TupleType({type: new sb.UnsignedIntType, length: 5});
 * @extends Type
 * @inheritdoc
 */
class TupleType extends AbsoluteType {
	static get _value() {
		return 0x50;
	}
	/**
	 * @param {{type, length}} params
	 * @param {Type} params.type The type of each element in the tuple
	 * @param {number} params.length The number of elements in the tuple
	 * Must fit in a 4-byte unsigned integer.
	 */
	constructor({type, length}) {
		super();
		assert.instanceOf(type, Type);
		assert.fourByteUnsignedInteger(length);
		this.type = type;
		this.length = length;
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer);
			buffer.addAll(lengthBuffer(this.length));
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, [10, 5, 101, 43, 889]);
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Array);
		if (value.length !== this.length) throw new Error('Length does not match');
		for (let instance of value) this.type.writeValue(buffer, instance, false);
		setPointers(buffer, root);
	}
}
//Stored in constants so that misspelling will result in an Error rather than undefined
const NAME = 'name';
const TYPE = 'type';
/**
 * A type storing up to 255 named fields
 * @example
 * //For storing a person's information
 * let type = new sb.StructType({
 *   name: new sb.StringType,
 *   age: new sb.UnsignedByteType,
 *   drowsiness: new sb.DoubleType
 * });
 * @extends Type
 * @inheritdoc
 */
class StructType extends AbsoluteType {
	static get _value() {
		return 0x51;
	}
	/**
	 * @param {Object.<string, Type>} fields A mapping of field names to their types.
	 * There can be no more than 255 fields.
	 * Each field name must be at most 255 bytes long in UTF-8.
	 */
	constructor(fields) {
		super();
		assert.instanceOf(fields, Object);
		let fieldCount = 0;
		for (let _ in fields) fieldCount++; //eslint-disable-line no-unused-vars
		try { assert.byteUnsignedInteger(fieldCount); }
		catch (e) { throw new Error(String(fieldCount) + ' fields is too many'); }
		this.fields = new Array(fieldCount); //really a set, but we want ordering to be fixed so that type bytes are consistent
		let i = 0;
		for (let fieldName in fields) {
			try { assert.byteUnsignedInteger(Buffer.byteLength(fieldName)); }
			catch (e) { throw new Error('Field name ' + fieldName + ' is too long'); }
			const fieldType = fields[fieldName];
			try { assert.instanceOf(fieldType, Type); }
			catch (e) { throw new Error(String(fieldType) + ' is not a valid field type'); }
			const resultField = {};
			resultField[NAME] = fieldName;
			resultField[TYPE] = fieldType;
			this.fields[i] = resultField;
			i++;
		}
		this.fields.sort((a, b) => { //so field order is predictable
			if (a[NAME] < b[NAME]) return -1;
			else if (a[NAME] > b[NAME]) return 1;
			else throw new Error('Should not have any duplicate fields');
		});
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			buffer.add(this.fields.length);
			for (let field of this.fields) {
				const nameBuffer = Buffer.from(field[NAME]);
				buffer.add(nameBuffer.length);
				buffer.addAll(nameBuffer);
				field[TYPE].addToBuffer(buffer);
			}
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Object} value The value to write. Each field must have a valid value supplied.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, {
	 *   name: 'Papa',
	 *   age: 67,
	 *   drowsiness: 0.2
	 * });
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Object);
		for (let field of this.fields) field[TYPE].writeValue(buffer, value[field[NAME]], false);
		setPointers(buffer, root);
	}
}
/**
 * A type storing a variable-length array of values of the same type.
 * The length of any value must fit in a 4-byte unsigned integer.
 * @example
 * //For storing some number of people in order
 * let personType = new sb.StructType({...});
 * let type = new sb.ArrayType(personType);
 * @extends Type
 * @inheritdoc
 */
class ArrayType extends AbsoluteType {
	static get _value() {
		return 0x52;
	}
	/**
	 * @param {Type} type The type of each element in the array
	 */
	constructor(type) {
		super();
		assert.instanceOf(type, Type);
		this.type = type;
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) this.type.addToBuffer(buffer);
	}
	/**
	 * Writes any iterable value to the buffer;
	 * used by ArrayType and SetType
	 * @private
	*/
	_writeValue(buffer, value, root) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.fourByteUnsignedInteger(value.length);
		buffer.addAll(lengthBuffer(value.length));
		for (let instance of value) this.type.writeValue(buffer, instance, false);
		setPointers(buffer, root);
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type[]} value The value to write. Length of the array must fit in a 4-byte unsigned integer.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, [person1, person2, person3]);
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(value, Array);
		this._writeValue(buffer, value, root);
	}
}
/**
 * A type storing a variable-size set of values of the same type.
 * The size of any value must fit in a 4-byte unsigned integer.
 * Works much like {@link ArrayType} except all values are {@link Set}s.
 * @example
 * //For storing some number of people
 * let personType = new sb.StructType({...});
 * let type = new sb.SetType(personType);
 * @extends ArrayType
 * @inheritdoc
 */
class SetType extends ArrayType {
	static get _value() {
		return 0x53;
	}
	/**
	 * @param {Type} type The type of each element in the set
	 */
	constructor(type) {
		super(type);
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Set.<type>} value The value to write. Size of the set must fit in a 4-byte unsigned integer.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, new Set().add(person1).add(person2).add(person3));
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(value, Set);
		value.length = value.size;
		this._writeValue(buffer, value, root);
	}
}
/**
 * A type storing a variable-size mapping of keys of one type to values of another.
 * The size of any map must fit in a 4-byte unsigned integer.
 * @example
 * //For storing friendships (a mapping of people to their set of friends)
 * let personType = new sb.StructType({...});
 * let type = new sb.MapType(
 *   personType,
 *   new sb.SetType(personType)
 * );
 * @extends Type
 * @inheritdoc
 */
class MapType extends AbsoluteType {
	static get _value() {
		return 0x54;
	}
	/**
	 * @param {Type} keyType The type of each key in the map
	 * @param {Type} valueType The type of each value in the map
	 */
	constructor(keyType, valueType) {
		super();
		assert.instanceOf(keyType, Type);
		assert.instanceOf(valueType, Type);
		this.keyType = keyType;
		this.valueType = valueType;
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			this.keyType.addToBuffer(buffer);
			this.valueType.addToBuffer(buffer);
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Map.<keyType, valueType>} value The value to write. Size of the map must fit in a 4-byte unsigned integer.
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * let friendMap = new Map;
	 * friendMap.set(person1, new Set().add(person2).add(person3));
	 * friendMap.set(person2, new Set([person1]));
	 * friendMap.set(person3, new Set([person1]));
	 * type.writeValue(buffer, friendMap);
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Map);
		assert.fourByteUnsignedInteger(value.size);
		buffer.addAll(lengthBuffer(value.size));
		for (let [mapKey, mapValue] of value) {
			this.keyType.writeValue(buffer, mapKey, false);
			this.valueType.writeValue(buffer, mapValue, false);
		}
		setPointers(buffer, root);
	}
}
/**
 * A type storing a value in a fixed set of possible values.
 * There can be at most 255 possible values.
 * @example
 * //Storing different species' characteristics
 * const HUMAN = {heightFt: 6, speedMph: 28};
 * const CHEETAH = {heightFt: 3, speedMph: 70};
 * let type = new sb.EnumType({
 *   type: new sb.StructType({
 *     heightFt: new sb.FloatType,
 *     speedMph: new sb.UnsignedByteType
 *   }),
 *   values: [HUMAN, CHEETAH]
 * });
 * @extends Type
 * @inheritdoc
 */
class EnumType extends Type {
	static get _value() {
		return 0x55;
	}
	/**
	 * @param {{type, value}} params
	 * @param {Type} params.type The type of each element in the tuple
	 * @param {type[]} params.values The possible distinct values.
	 * Cannot contain more than 255 values.
	 * @throws {Error} If any value is invalid for {@link type}
	 */
	constructor({type, values}) {
		super();
		assert.instanceOf(type, AbsoluteType);
		assert.instanceOf(values, Array);
		try { assert.byteUnsignedInteger(values.length); }
		catch (e) { throw new Error(String(values.length) + ' values is too many'); }
		const valueIndices = new Map;
		for (let i = 0; i < values.length; i++) {
			const value = values[i];
			const valueBuffer = type.valueBuffer(value).toString(BINARY);
			assert.assert(!valueIndices.has(valueBuffer), 'Value is repeated: ' + util.inspect(value));
			valueIndices.set(valueBuffer, i);
		}
		this.type = type;
		this.values = values;
		this.valueIndices = valueIndices;
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			this.type.addToBuffer(buffer);
			buffer.add(this.valueIndices.size);
			for (let [valueBuffer, _] of this.valueIndices) buffer.addAll(Buffer.from(valueBuffer, BINARY)); //eslint-disable-line no-unused-vars
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, CHEETAH);
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer);
		const valueBuffer = new GrowableBuffer;
		this.type.writeValue(valueBuffer, value, false);
		const index = this.valueIndices.get(valueBuffer.toBuffer().toString(BINARY));
		assert.assert(index !== undefined, 'Not a valid enum value: ' + util.inspect(value));
		buffer.add(index);
		setPointers(buffer, root);
	}
}
/**
 * A type storing a value of one of several fixed types.
 * The list of possible types must contain at most 255 types.
 * @example
 * //If you have a lot of numbers that fit in an unsigned byte
 * //but could conceivably have one that requires a long
 * let type = new sb.ChoiceType([
 *   new sb.UnsignedByteType,
 *   new sb.UnsignedLongType
 * ]);
 * @extends Type
 * @inheritdoc
 */
class ChoiceType extends Type {
	static get _value() {
		return 0x56;
	}
	/**
	 * @param {Type[]} types The list of possible types.
	 * Cannot contain more than 255 types.
	 * Values will be written using the first type in the list
	 * that successfully writes the value,
	 * so place higher priority types earlier.
	 */
	constructor(types) {
		super();
		assert.instanceOf(types, Array);
		try { assert.byteUnsignedInteger(types.length); }
		catch (e) { throw new Error(String(types.length) + ' types is too many'); }
		for (let type of types) assert.instanceOf(type, Type);
		this.types = types;
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) {
			buffer.add(this.types.length);
			for (let type of this.types) type.addToBuffer(buffer);
		}
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, 10); //writes as an unsigned byte
	 * type.writeValue(buffer, 1000); //writes as an unsigned long
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer);
		let i = 0;
		let success = false;
		for (let type of this.types) {
			let valueBuffer = new GrowableBuffer;
			try { type.writeValue(valueBuffer, value, false) } //eslint-disable-line semi
			catch (e) {
				i++;
				continue;
			}
			buffer.add(i);
			buffer.addAll(valueBuffer.toBuffer());
			success = true;
			break;
		}
		if (!success) assert.fail('No types matched: ' + util.inspect(success));
		setPointers(buffer, root);
	}
}
/**
 * A type storing a value of another type or {@link null}
 * @example
 * //If you have a job slot that may or may not be filled
 * let personType = new sb.StructType({...});
 * let type = new sb.StructType({
 *   title: new sb.StringType,
 *   employee: new sb.OptionalType(personType)
 * });
 * @extends Type
 * @inheritdoc
 */
class OptionalType extends AbsoluteType {
	static get _value() {
		return 0x60;
	}
	/**
	 * @param {Type} type The type of any non-{@link null} value
	 */
	constructor(type) {
		super();
		assert.instanceOf(type, Type);
		this.type = type;
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) this.type.addToBuffer(buffer);
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {null|type} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * type.writeValue(buffer, {
	 *   title: 'Manager',
	 *   employee: person1
	 * });
	 * type.writeValue(buffer, {
	 *   title: 'Assistant Librarian',
	 *   employee: null
	 * });
	 */
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer);
		if (value === null) buffer.add(0x00);
		else {
			buffer.add(0xFF);
			this.type.writeValue(buffer, value, false);
		}
		setPointers(buffer, root);
	}
}
/**
 * A type storing a value of another type through a pointer.
 * If you expect to have the same value repeated many times,
 * using a pointer will decrease the size of the value {@link Buffer}.
 * @example
 * //If the same people will be used many times
 * let personType = new sb.PointerType(
 *   new sb.StructType({
 *     dob: new sb.DateType,
 *     id: new sb.UnsignedShortType,
 *     name: new sb.StringType
 *   })
 * );
 * let tribeType = new sb.StructType({
 *   leader: personType,
 *   members: new sb.SetType(personType),
 *   money: new sb.MapType(personType, new sb.FloatType)
 * });
 * @extends Type
 * @inheritdoc
 */
class PointerType extends Type {
	static get _value() {
		return 0x70;
	}
	/**
	 * @param {Type} type The type of any value
	 */
	constructor(type) {
		super();
		assert.instanceOf(type, AbsoluteType);
		this.type = type;
	}
	addToBuffer(buffer) {
		if (super.addToBuffer(buffer)) this.type.addToBuffer(buffer);
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {type} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 * @example
	 * let louis = {
	 *   dob: new Date(1437592284193),
	 *   id: 9,
	 *   name: 'Louis'
	 * },
	 * garfield = {
	 *   dob: new Date(1437592284194),
	 *   id: 17,
	 *   name: 'Garfield'
	 * };
	 * let value = {
	 *   leader: {
	 *     dob: new Date(1437592284192),
	 *     id: 10,
	 *     name: 'Joe'
	 *   },
	 *   members: new Set().add(louis).add(garfield),
	 *   money: new Map().set(louis, 23.05).set(garfield, -10.07)
	 * };
	 * tribeType.writeValue(buffer, value);
	 */
	writeValue(buffer, value, root = true) {
		if (buffer.pointers === undefined) buffer.pointers = new Map;
		const valueBuffer = new GrowableBuffer;
		this.type.writeValue(valueBuffer, value);
		const valueString = valueBuffer.toBuffer().toString(BINARY); //have to convert the buffer to a string because equivalent buffers are not ===
		const currentIndex = buffer.length;
		const previousSet = buffer.pointers.get(valueString);
		if (previousSet) previousSet.add(currentIndex);
		else buffer.pointers.set(valueString, new Set([currentIndex]));
		buffer.addAll(Buffer.allocUnsafe(4)); //placeholder for pointer
		setPointers(buffer, root);
	}
}

module.exports = {
	Type,
	ByteType,
	ShortType,
	IntType,
	LongType,
	UnsignedByteType,
	UnsignedShortType,
	UnsignedIntType,
	UnsignedLongType,
	DateType,
	FloatType,
	DoubleType,
	BooleanType,
	BooleanTupleType,
	BooleanArrayType,
	CharType,
	StringType,
	OctetsType,
	TupleType,
	StructType,
	ArrayType,
	SetType,
	MapType,
	EnumType,
	ChoiceType,
	OptionalType,
	PointerType,
	REPEATED_TYPE
};