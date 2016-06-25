const assert = require(__dirname + '/lib/assert.js');
const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js');

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
}
class ShortType extends IntegerType {
	static get _value() {
		return 0x02;
	}
}
class IntType extends IntegerType {
	static get _value() {
		return 0x03;
	}
}
class LongType extends IntegerType {
	static get _value() {
		return 0x04;
	}
}

//Unsigned integer type
class UnsignedType extends AbsoluteType {}
class UnsignedByteType extends UnsignedType {
	static get _value() {
		return 0x11;
	}
}
class UnsignedShortType extends UnsignedType {
	static get _value() {
		return 0x12;
	}
}
class UnsignedIntType extends UnsignedType {
	static get _value() {
		return 0x13;
	}
}
class UnsignedLongType extends UnsignedType {
	static get _value() {
		return 0x14;
	}
}

//Floating point type
class FloatingPointType extends AbsoluteType {}
class FloatType extends FloatingPointType {
	static get _value() {
		return 0x20;
	}
}
class DoubleType extends FloatingPointType {
	static get _value() {
		return 0x21;
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