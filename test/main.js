const assert = require(__dirname + '/../lib/assert.js');
const GrowableBuffer = require(__dirname + '/../lib/growable-buffer.js');
const t = require(__dirname + '/../structure-types.js');

console.log('STRUCT');
let struct = new t.StructType([
	{name: 'bobbé', type: new t.BooleanType()},
	{name: '', type: new t.IntType()}
]);
console.log(struct);
console.log(struct.toBuffer());

console.log('ARRAY');
let array = new t.ArrayType(
	new t.UnsignedIntType()
);
console.log(array);
console.log(array.toBuffer());

console.log('SET');
let set = new t.SetType(
	new t.StructType([
		{name: 'long', type: new t.LongType()},
		{name: 'str', type: new t.StringType()}
	])
);
console.log(set);
console.log(set.toBuffer());

console.log('MAP');
let map = new t.MapType(
	new t.StringType(),
	new t.StructType([
		{name: 'a', type: new t.ArrayType(new t.UnsignedByteType())},
		{name: 'b—c', type: new t.CharType()}
	])
);
console.log(map);
console.log(map.toBuffer());

console.log('OPTIONAL');
let optional = new t.OptionalType(set);
console.log(optional);
console.log(optional.toBuffer());

console.log('POINTER');
let pointer = new t.PointerType(new t.LongType());
console.log(pointer);
console.log(pointer.toBuffer());

console.log('SIGNATURES');
//new t.IntType().getSignature(console.log);
//new t.ArrayType(new t.IntType()).getSignature(console.log);

console.log();
console.log('VALUES');
let gb;
console.log('Byte');
let type = new t.ByteType();
gb = new GrowableBuffer();
type.writeValue(gb, -128);
console.log(gb.toBuffer());
console.log('Short');
type = new t.ShortType();
gb = new GrowableBuffer();
type.writeValue(gb, 32767);
console.log(gb.toBuffer());
console.log('Int');
type = new t.IntType();
gb = new GrowableBuffer();
type.writeValue(gb, -2147483648);
console.log(gb.toBuffer());
console.log('Long');
type = new t.LongType();
gb = new GrowableBuffer();
type.writeValue(gb, '9223372036854775807');
console.log(gb.toBuffer());
console.log('Unsigned byte');
type = new t.UnsignedByteType();
gb = new GrowableBuffer();
type.writeValue(gb, 255);
console.log(gb.toBuffer());
console.log('Unsigned short');
type = new t.UnsignedShortType();
gb = new GrowableBuffer();
type.writeValue(gb, 65535);
console.log(gb.toBuffer());
console.log('Unsigned int');
type = new t.UnsignedIntType();
gb = new GrowableBuffer();
type.writeValue(gb, 4294967295);
console.log(gb.toBuffer());
console.log('Unsigned long');
type = new t.UnsignedLongType();
gb = new GrowableBuffer();
type.writeValue(gb, '18446744073709551615');
console.log(gb.toBuffer());
console.log('Float');
type = new t.FloatType();
gb = new GrowableBuffer();
type.writeValue(gb, Infinity);
console.log(gb.toBuffer());
console.log('Double');
type = new t.DoubleType();
gb = new GrowableBuffer();
type.writeValue(gb, -Infinity);
console.log(gb.toBuffer());
console.log('Boolean');
type = new t.BooleanType();
gb = new GrowableBuffer();
type.writeValue(gb, false);
type.writeValue(gb, true);
console.log(gb.toBuffer());
console.log('Boolean tuple');
type = new t.BooleanTupleType(11);
gb = new GrowableBuffer();
type.writeValue(gb, [true, false, true, true, false, true, true, true, false, false, true]);
console.log(gb.toBuffer());
console.log('Boolean array');
type = new t.BooleanArrayType();
gb = new GrowableBuffer();
type.writeValue(gb, [true, false, true, true, false, true, true, true, false, false, true]);
console.log(gb.toBuffer());