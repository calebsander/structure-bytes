const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js');

class Type {
  static get _value() {
    throw new Error('Generic Type has no value byte');
  }
  toBuffer() {
    if (!this.cachedBuffer) this.cachedBuffer = this._toBuffer();
    return this.cachedBuffer;
  }
  _toBuffer() {
    let buffer = Buffer.allocUnsafe(1);
    buffer[0] = this.constructor._value;
    return buffer;
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

module.exports = {
  ByteType,
  ShortType,
  IntType,
  LongType
};