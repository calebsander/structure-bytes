//For use with browserify
if (__dirname === '/') __dirname = '';

const assert = require(__dirname + '/lib/assert.js');
const BufferStream = require(__dirname + '/lib/buffer-stream.js');
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

class Type {
	//The byte specifying the type (unique to each type class)
	static get _value() {
		throw new Error('Generic Type has no value byte');
	}
	/*
		Append the type information to the GrowableBuffer
		All types start with the byte specified by _value
		For the most primitive types, this implementation is sufficient
		Recursive types should override this method, invoking super.addToBuffer() and then adding their own data
	*/
	addToBuffer(buffer) {
		assert.instanceOf(buffer, GrowableBuffer);
		buffer.add(this.constructor._value);
	}
	//Gets the type in buffer form, using a cached value if present
	//Since types are immutable, the result should never change from the cached value
	toBuffer() {
		if (!this.cachedBuffer) this.cachedBuffer = this._toBuffer();
		return this.cachedBuffer;
	}
	//Generates the type in buffer form
	_toBuffer() {
		const buffer = new GrowableBuffer();
		this.addToBuffer(buffer);
		return buffer.toBuffer();
	}
	//Gets an SHA256 hash of the type, using a cached value if present (async)
	getHash() {
		if (!this.cachedHash) this.cachedHash = this._getHash();
		return this.cachedHash;
	}
	//Gets an SHA256 hash of the type (async)
	_getHash() {
		const hash = createHash('sha256');
		hash.update(this.toBuffer());
		return hash.digest('base64');
	}
	//Gets a signature string for the type, using a cached value if present (async)
	getSignature() {
		if (!this.cachedSignature) this.cachedSignature = this._getSignature();
		return this.cachedSignature;
	}
	//Gets a signature string for the type, identifying version and type information (async)
	_getSignature() {
		return config.VERSION_STRING + this.getHash();
	}
	//Writes out the value according to the type spec
	writeValue(buffer, value) {
		throw new Error('Generic Type has no value representation');
	}
	//Returns whether the two types are equal
	equals(otherType) {
		try { assert.instanceOf(otherType, this.constructor) }
		catch (e) { return false }
		for (let param in this) {
			if (this.hasOwnProperty(param) && !param.startsWith('cached')) {
				try { assert.equal(otherType[param], this[param]) }
				catch (e) { return false }
			}
		}
		return true;
	}
}

//Non-pointer type
class AbsoluteType extends Type {}

//Integer type
class IntegerType extends AbsoluteType {}
class ByteType extends IntegerType {
	static get _value() {
		return 0x01;
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(1);
		byteBuffer.writeInt8(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class ShortType extends IntegerType {
	static get _value() {
		return 0x02;
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(2);
		byteBuffer.writeInt16BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class IntType extends IntegerType {
	static get _value() {
		return 0x03;
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(4);
		byteBuffer.writeInt32BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class LongType extends IntegerType {
	static get _value() {
		return 0x04;
	}
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

//Unsigned integer type
class UnsignedType extends AbsoluteType {}
class UnsignedByteType extends UnsignedType {
	static get _value() {
		return 0x11;
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(1);
		byteBuffer.writeUInt8(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class UnsignedShortType extends UnsignedType {
	static get _value() {
		return 0x12;
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
		const byteBuffer = Buffer.allocUnsafe(2);
		byteBuffer.writeUInt16BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class UnsignedIntType extends UnsignedType {
	static get _value() {
		return 0x13;
	}
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
class UnsignedLongType extends UnsignedType {
	static get _value() {
		return 0x14;
	}
	writeValue(buffer, value) {
		writeUnsignedLong(buffer, value);
	}
}
class DateType extends AbsoluteType {
	static get _value() {
		return 0x15;
	}
	writeValue(buffer, value) {
		assert.instanceOf(value, Date);
		writeUnsignedLong(buffer, String(value.getTime()));
	}
}

//Floating point type
class FloatingPointType extends AbsoluteType {
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Number);
	}
}
class FloatType extends FloatingPointType {
	static get _value() {
		return 0x20;
	}
	writeValue(buffer, value) {
		super.writeValue(buffer, value);
		const byteBuffer = Buffer.allocUnsafe(4);
		byteBuffer.writeFloatBE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class DoubleType extends FloatingPointType {
	static get _value() {
		return 0x21;
	}
	writeValue(buffer, value) {
		super.writeValue(buffer, value);
		const byteBuffer = Buffer.allocUnsafe(8);
		byteBuffer.writeDoubleBE(value, 0);
		buffer.addAll(byteBuffer);
	}
}

class BooleanType extends AbsoluteType {
	static get _value() {
		return 0x30;
	}
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
class BooleanTupleType extends AbsoluteType {
	static get _value() {
		return 0x31;
	}
	constructor(length) {
		super();
		assert.fourByteUnsignedInteger(length);
		this.length = length;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		buffer.addAll(lengthBuffer(this.length));
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Array);
		if (value.length !== this.length) throw new Error('Length does not match');
		writeBooleans(buffer, value);
	}
}
class BooleanArrayType extends AbsoluteType {
	static get _value() {
		return 0x32;
	}
	writeValue(buffer, value) {
		assert.instanceOf(value, Array);
		assert.fourByteUnsignedInteger(value.length);
		buffer.addAll(lengthBuffer(value.length));
		writeBooleans(buffer, value);
	}
}

class CharType extends AbsoluteType {
	static get _value() {
		return 0x40;
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, String);
		assert.assert(value.length === 1, 'String must contain only 1 character');
		buffer.addAll(Buffer.from(value));
	}
}
class StringType extends AbsoluteType {
	static get _value() {
		return 0x41;
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, String);
		const valueBuffer = Buffer.from(value);
		buffer.addAll(valueBuffer);
		buffer.add(0);
	}
}

class TupleType extends AbsoluteType {
	static get _value() {
		return 0x50;
	}
	constructor({type, length}) {
		super();
		assert.instanceOf(type, Type);
		assert.fourByteUnsignedInteger(length);
		this.type = type;
		this.length = length;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		this.type.addToBuffer(buffer);
		buffer.addAll(lengthBuffer(this.length));
	}
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Array);
		if (value.length !== this.length) throw new Error('Length does not match');
		for (let instance of value) this.type.writeValue(buffer, instance, false);
		setPointers(buffer, root);
	}
}
const NAME = 'name';
const TYPE = 'type';
class StructType extends AbsoluteType {
	static get _value() {
		return 0x51;
	}
	//fields should be an Object mapping field names to types, e.g. {field1: new t.ByteType, field2: new t.StringType}
	constructor(fields) {
		super();
		assert.instanceOf(fields, Object);
		let fieldCount = 0;
		for (let field in fields) fieldCount++;
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
		super.addToBuffer(buffer);
		buffer.add(this.fields.length);
		for (let field of this.fields) {
			const nameBuffer = Buffer.from(field[NAME]);
			buffer.add(nameBuffer.length);
			buffer.addAll(nameBuffer);
			field[TYPE].addToBuffer(buffer);
		}
	}
	writeValue(buffer, value, root = true) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.instanceOf(value, Object);
		for (let field of this.fields) field[TYPE].writeValue(buffer, value[field[NAME]], false);
		setPointers(buffer, root);
	}
}
class ArrayType extends AbsoluteType {
	static get _value() {
		return 0x52;
	}
	constructor(type) {
		super();
		assert.instanceOf(type, Type);
		this.type = type;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		this.type.addToBuffer(buffer);
	}
	_writeValue(buffer, value, root) {
		assert.instanceOf(buffer, GrowableBuffer);
		assert.fourByteUnsignedInteger(value.length);
		buffer.addAll(lengthBuffer(value.length));
		for (let instance of value) this.type.writeValue(buffer, instance, false);
		setPointers(buffer, root);
	}
	writeValue(buffer, value, root = true) {
		assert.instanceOf(value, Array);
		this._writeValue(buffer, value, root);
	}
}
class SetType extends ArrayType {
	static get _value() {
		return 0x53;
	}
	writeValue(buffer, value, root = true) {
		assert.instanceOf(value, Set);
		value.length = value.size;
		super._writeValue(buffer, value, root);
	}
}
class MapType extends AbsoluteType {
	static get _value() {
		return 0x54;
	}
	constructor(keyType, valueType) {
		super();
		assert.instanceOf(keyType, Type);
		assert.instanceOf(valueType, Type);
		this.keyType = keyType;
		this.valueType = valueType;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		this.keyType.addToBuffer(buffer);
		this.valueType.addToBuffer(buffer);
	}
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
const VALUE = 'value';
class EnumType extends Type {
	static get _value() {
		return 0x55;
	}
	constructor({type, values}) {
		super();
		assert.instanceOf(type, Type);
		assert.instanceOf(values, Array);
		try { assert.byteUnsignedInteger(values.length); }
		catch (e) { throw new Error(String(values.length) + ' values is too many'); }
		const valueIndices = new Map();
		for (let i = 0; i < values.length; i++) {
			const value = values[i];
			const buffer = new GrowableBuffer();
			type.writeValue(buffer, value)
			const valueBuffer = buffer.toBuffer().toString(BINARY);
			assert.assert(!valueIndices.has(valueBuffer), 'Value is repeated: ' + util.inspect(value));
			valueIndices.set(valueBuffer, i);
		}
		this.type = type;
		this.values = values;
		this.valueIndices = valueIndices;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		this.type.addToBuffer(buffer);
		buffer.add(this.valueIndices.size);
		for (let [valueBuffer, _] of this.valueIndices) buffer.addAll(Buffer.from(valueBuffer));
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		const valueBuffer = new GrowableBuffer();
		this.type.writeValue(valueBuffer, value);
		const index = this.valueIndices.get(valueBuffer.toBuffer().toString(BINARY));
		assert.assert(index !== undefined, 'Not a valid enum value: ' + util.inspect(value));
		buffer.add(index);
	}
}
class ChoiceType extends Type {
	static get _value() {
		return 0x56;
	}
	constructor(types) {
		super();
		assert.instanceOf(types, Array);
		try { assert.byteUnsignedInteger(types.length); }
		catch (e) { throw new Error(String(types.length) + ' types is too many'); }
		for (let type of types) assert.instanceOf(type, Type);
		this.types = types;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		buffer.add(this.types.length);
		for (let type of this.types) type.addToBuffer(buffer);
	}
	writeValue(buffer, value) {
		assert.instanceOf(buffer, GrowableBuffer);
		let i = 0;
		let success = false;
		for (let type of this.types) {
			let valueBuffer = new GrowableBuffer();
			try { type.writeValue(valueBuffer, value) }
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
	}
}
class OptionalType extends AbsoluteType {
	static get _value() {
		return 0x60;
	}
	constructor(type) {
		super();
		assert.instanceOf(type, Type);
		this.type = type;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		this.type.addToBuffer(buffer);
	}
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
class PointerType extends Type {
	static get _value() {
		return 0x70;
	}
	constructor(type) {
		super();
		assert.instanceOf(type, AbsoluteType);
		this.type = type;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		this.type.addToBuffer(buffer);
	}
	writeValue(buffer, value, root = true) {
		if (buffer.pointers === undefined) buffer.pointers = new Map();
		const valueBuffer = new GrowableBuffer();
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
	TupleType,
	StructType,
	ArrayType,
	SetType,
	MapType,
	EnumType,
	ChoiceType,
	OptionalType,
	PointerType
};