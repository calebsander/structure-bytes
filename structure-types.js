const assert = require(__dirname + '/lib/assert.js');
const BufferStream = require(__dirname + '/lib/buffer-stream.js');
const config = require(__dirname + '/config.js');
const crypto = require('crypto');
const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js');
const strnum = require(__dirname + '/lib/strint.js');

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
	toBuffer() {
		if (!this.cachedBuffer) this.cachedBuffer = this._toBuffer();
		return this.cachedBuffer;
	}
	//Generates the type in buffer form
	_toBuffer() {
		let buffer = new GrowableBuffer();
		this.addToBuffer(buffer);
		return buffer.toBuffer();
	}
	//Gets an SHA256 hash of the type (async)
	getHash(callback) {
		assert.instanceOf(callback, Function);
		let buffer = new GrowableBuffer();
		this.addToBuffer(buffer);
		let hash = crypto.createHash('sha256');
		new BufferStream(buffer).pipe(hash).on('finish', () => {
			callback(hash.read().toString('base64'));
		});
	}
	//Gets a signature string for the type, identifying version and type information (async)
	getSignature(callback) {
		this.getHash((hash) => {
			callback(config.VERSION_STRING + hash);
		});
	}
	//Writes out the value according to the type spec
	writeValue(buffer, value) {
		throw new Error('Generic Type has no value representation');
	}
}

//Non-pointer type
class AbsoluteType extends Type {}

class NullType extends AbsoluteType {
	static get _value() {
		return 0x00;
	}
}

//Integer type
class IntegerType extends AbsoluteType {}
class ByteType extends IntegerType {
	static get _value() {
		return 0x01;
	}
	writeValue(buffer, value) {
		let byteBuffer = Buffer.allocUnsafe(1);
		byteBuffer.writeInt8(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class ShortType extends IntegerType {
	static get _value() {
		return 0x02;
	}
	writeValue(buffer, value) {
		let byteBuffer = Buffer.allocUnsafe(2);
		byteBuffer.writeInt16BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class IntType extends IntegerType {
	static get _value() {
		return 0x03;
	}
	writeValue(buffer, value) {
		let byteBuffer = Buffer.allocUnsafe(4);
		byteBuffer.writeInt32BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
const LONG_UPPER_SHIFT = '4294967296'; //stores the value needed to multiply an integer to shift it left 32 bits - for long math
class LongType extends IntegerType {
	static get _value() {
		return 0x04;
	}
	writeValue(buffer, value) {
		assert.instanceOf(value, String);
		if (strnum.gt(value, '9223372036854775807') || strnum.lt(value, '-9223372036854775808')) throw new Error('Value out of range');
		let upper = strnum.div(value, LONG_UPPER_SHIFT, true); //get upper signed int
		let lower = strnum.sub(value, strnum.mul(upper, LONG_UPPER_SHIFT)); //get lower unsigned int
		let byteBuffer = Buffer.allocUnsafe(8);
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
		let byteBuffer = Buffer.allocUnsafe(1);
		byteBuffer.writeUInt8(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class UnsignedShortType extends UnsignedType {
	static get _value() {
		return 0x12;
	}
	writeValue(buffer, value) {
		let byteBuffer = Buffer.allocUnsafe(2);
		byteBuffer.writeUInt16BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class UnsignedIntType extends UnsignedType {
	static get _value() {
		return 0x13;
	}
	writeValue(buffer, value) {
		let byteBuffer = Buffer.allocUnsafe(4);
		byteBuffer.writeUInt32BE(value, 0);
		buffer.addAll(byteBuffer);
	}
}
class UnsignedLongType extends UnsignedType {
	static get _value() {
		return 0x14;
	}
	writeValue(buffer, value) {
		assert.instanceOf(value, String);
		if (strnum.gt(value, '18446744073709551615') || strnum.lt(value, '0')) throw new Error('Value out of range');
		let upper = strnum.div(value, LONG_UPPER_SHIFT);
		let lower = strnum.sub(value, strnum.mul(upper, LONG_UPPER_SHIFT));
		let byteBuffer = Buffer.allocUnsafe(8);
		byteBuffer.writeUInt32BE(Number(upper), 0);
		byteBuffer.writeUInt32BE(Number(lower), 4);
		buffer.addAll(byteBuffer);
	}
}

//Floating point type
class FloatingPointType extends AbsoluteType {
	writeValue(buffer, value) {
		assert.instanceOf(value, Number);
	}
}
class FloatType extends FloatingPointType {
	static get _value() {
		return 0x20;
	}
	writeValue(buffer, value) {
		super.writeValue(buffer, value);
		let byteBuffer = Buffer.allocUnsafe(4);
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
		let byteBuffer = Buffer.allocUnsafe(8);
		byteBuffer.writeDoubleBE(value, 0);
		buffer.addAll(byteBuffer);
	}
}

class BooleanType extends AbsoluteType {
	static get _value() {
		return 0x30;
	}
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
		let lengthBuffer = Buffer.allocUnsafe(4);
		lengthBuffer.writeUInt32BE(this.length, 0);
		buffer.addAll(lengthBuffer);
	}
}
class BooleanArrayType extends AbsoluteType {
	static get _value() {
		return 0x32;
	}
}

class CharType extends AbsoluteType {
	static get _value() {
		return 0x40;
	}
}
class StringType extends AbsoluteType {
	static get _value() {
		return 0x41;
	}
}

class TupleType extends AbsoluteType {
	static get _value() {
		return 0x50;
	}
	constructor(type, length) {
		super();
		assert.instanceOf(type, Type);
		assert.fourByteUnsignedInteger(length);
		this.type = type;
		this.length = length;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		this.type.addToBuffer(buffer);
		let lengthBuffer = Buffer.allocUnsafe(4);
		lengthBuffer.writeUInt32BE(this.length, 0);
		buffer.addAll(lengthBuffer);
	}
}
const NAME = 'name';
const TYPE = 'type';
class StructType extends AbsoluteType {
	static get _value() {
		return 0x51;
	}
	//fields should be an array of {type, field} Objects
	constructor(fields) {
		super();
		assert.instanceOf(fields, Array);
		try { assert.byteUnsignedInteger(fields.length); }
		catch (e) { throw new Error(String(fields.length) + ' fields is too many'); }
		this.fields = []; //really a set, but we want ordering to be fixed so that type bytes are consistent
		let fieldNames = new Set();
		for (let field of fields) { //copying fields to this.fields so that resultant StructType is immutable
			try { assert.instanceOf(field, Object); }
			catch (e) { throw new Error(String(field) + ' is not a valid field object'); }
			let fieldName = field[NAME];
			try { assert.instanceOf(fieldName, String); }
			catch (e) { throw new Error(String(fieldName) + ' is not a valid field name'); }
			try { assert.byteUnsignedInteger(Buffer.byteLength(fieldName)); }
			catch (e) { throw new Error('Field name ' + fieldName + ' is too long'); }
			try { assert.notIn(fieldName, fieldNames); }
			catch (e) { throw new Error('Duplicate field name: ' + fieldName); }
			let fieldType = field[TYPE];
			try { assert.instanceOf(fieldType, Type); }
			catch (e) { throw new Error(String(fieldType) + ' is not a valid field type'); }
			let resultField = {};
			resultField[NAME] = fieldName;
			resultField[TYPE] = fieldType;
			this.fields.push(resultField);
			fieldNames.add(fieldName);
		}
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		buffer.add(this.fields.length);
		for (let field of this.fields) {
			buffer.add(Buffer.byteLength(field[NAME]));
			buffer.addAll(Buffer.from(field[NAME]));
			field[TYPE].addToBuffer(buffer);
		}
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
}
class SetType extends ArrayType {
	static get _value() {
		return 0x53;
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
}

module.exports = {
	ByteType,
	ShortType,
	IntType,
	LongType,
	UnsignedByteType,
	UnsignedShortType,
	UnsignedIntType,
	UnsignedLongType,
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
	OptionalType,
	PointerType
};