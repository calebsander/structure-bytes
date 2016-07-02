const assert = require(__dirname + '/lib/assert.js');
const t = require(__dirname + '/structure-types.js');

function consumeType(typeBuffer, offset) {
  assert.assert(typeBuffer.length > 0, 'Buffer is empty');
  let value, length = 0;
  switch (typeBuffer[0]) {
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
    default:
      assert.fail('No such type: 0x' + typeBuffer[0].toString(16))
  }
  return {value, length: length + 1};
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