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
class IntegerType extends Type {}
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
class UnsignedType extends Type {}
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
class FloatingPointType extends Type {}
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

class BooleanType extends Type {
	static get _value() {
		return 0x30;
	}
}
class BooleanTupleType extends Type {
	constructor(length) {
		super();
		assert.fourByteUnsignedInteger(length);
		this.length = length;
	}
	static get _value() {
		return 0x31;
	}
	addToBuffer(buffer) {
		super.addToBuffer(buffer);
		let lengthBuffer = Buffer.allocUnsafe(4);
		lengthBuffer.writeUInt32BE(this.length, 0);
		buffer.addAll(lengthBuffer);
	}
}
class BooleanArrayType extends Type {
	static get _value() {
		return 0x32;
	}
}

class CharType extends Type {
	static get _value() {
		return 0x40;
	}
}
class StringType extends Type {
	static get _value() {
		return 0x41;
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
	StringType
};