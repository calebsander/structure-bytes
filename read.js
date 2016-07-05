const assert = require(__dirname + '/lib/assert.js');
const t = require(__dirname + '/structure-types.js');

const NOT_LONG_ENOUGH = 'Buffer is not long enough';
function readLengthBuffer(typeBuffer, offset) {
  try { return {value: typeBuffer.readUInt32BE(offset), length: 4} }
  catch (e) { throw new Error(NOT_LONG_ENOUGH) }
}
function consumeType(typeBuffer, offset) {
  assert.assert(typeBuffer.length > 0, NOT_LONG_ENOUGH);
  let value, length = 1;
  switch (typeBuffer[offset]) {
    case t.ByteType._value:
      value = new t.ByteType();
      break;
    case t.ShortType._value:
      value = new t.ShortType();
      break;
    case t.IntType._value:
      value = new t.IntType();
      break;
    case t.LongType._value:
      value = new t.LongType();
      break;
    case t.UnsignedByteType._value:
      value = new t.UnsignedByteType();
      break;
    case t.UnsignedShortType._value:
      value = new t.UnsignedShortType();
      break;
    case t.UnsignedIntType._value:
      value = new t.UnsignedIntType();
      break;
    case t.UnsignedLongType._value:
      value = new t.UnsignedLongType();
      break;
    case t.FloatType._value:
      value = new t.FloatType();
      break;
    case t.DoubleType._value:
      value = new t.DoubleType();
      break;
    case t.BooleanType._value:
      value = new t.BooleanType();
      break;
    case t.BooleanTupleType._value:
      const booleanTupleLength = readLengthBuffer(typeBuffer, offset + length);
      value = new t.BooleanTupleType(booleanTupleLength.value);
      length += booleanTupleLength.length;
      break;
    case t.BooleanArrayType._value:
      value = new t.BooleanArrayType();
      break;
    case t.CharType._value:
      value = new t.CharType();
      break;
    case t.StringType._value:
      value = new t.StringType();
      break;
    case t.TupleType._value:
      const tupleType = consumeType(typeBuffer, offset + length);
      length += tupleType.length;
      const tupleLength = readLengthBuffer(typeBuffer, offset + length);
      length += tupleLength.length;
      value = new t.TupleType(tupleType.value, tupleLength.value);
      break;
    default:
      assert.fail('No such type: 0x' + typeBuffer[0].toString(16))
  }
  return {value, length};
}
function readType(typeBuffer, offset = 0) {
  assert.instanceOf(typeBuffer, Buffer);
  assert.integer(offset);
  const {value, length} = consumeType(typeBuffer, offset);
  assert.assert(length === typeBuffer.length, 'Did not consume all of the buffer');
  return value;
}

module.exports = {
  readType
};