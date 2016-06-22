const assert = require(__dirname + '/lib/assert.js');
const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js');

class Type {
	static get _value() {
		throw new Error('Generic Type has no value byte');
	}
	addToBuffer(buffer) {
		assert.instanceOf(buffer, GrowableBuffer);
		buffer.add(this.constructor._value);
	}
	toBuffer() {
		if (!this.cachedBuffer) this.cachedBuffer = this._toBuffer();
		return this.cachedBuffer;
	}
	_toBuffer() {
		let buffer = new GrowableBuffer();
		this.addToBuffer(buffer);
		return buffer.toBuffer();
	}
}

//Non-recursive type
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

module.exports = {
	ByteType,
	ShortType,
	IntType,
	LongType,
	UnsignedByteType,
	UnsignedShortType,
	UnsignedIntType,
	UnsignedLongType
};