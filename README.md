# structure-bytes
A Node.js library for more efficient data transfers by separating the structure from the values and efficiently storing each as binary data.

[![npm Version](https://img.shields.io/npm/v/structure-bytes.svg)](https://www.npmjs.com/package/structure-bytes)
[![Build Status](https://travis-ci.org/calebsander/structure-bytes.svg?branch=master)](https://travis-ci.org/calebsander/structure-bytes)
[![Coverage Status](https://coveralls.io/repos/github/calebsander/structure-bytes/badge.svg?branch=master)](https://coveralls.io/github/calebsander/structure-bytes?branch=master)
[![Dependencies](https://david-dm.org/calebsander/structure-bytes/status.svg)](https://david-dm.org/calebsander/structure-bytes)
[![Dev Dependencies](https://david-dm.org/calebsander/structure-bytes/dev-status.svg)](https://david-dm.org/calebsander/structure-bytes?type=dev)

## Concept
A lot of data, especially data designed to be used in many different languages, is stored in files or transfered over HTTP as either text files which can represent a wide variety of data structures (e.g. JSON) or in a format created to represent only one specific sort of data (e.g. MP3). The idea with this project is to get the advantages of both sorts of formats. This project is somewhat similar to Google's [Protocol Buffers](https://developers.google.com/protocol-buffers/), but was not designed to match its functionality. To accomplish this, the project was designed with several principles in mind:

- Types (user-created formats of data) are created by combining a wide variety of datatypes, both primitive and recursive. This allows for representations which accurately describe types (e.g. distinguishing between structs and mappings of strings to values, and numeric types, unlike JSON). Types are very customizable, so you can build any desired type formats.
- Types are kept separate from values (instances of a type) because types are designed to be created once and used to store many different values. This allows for communications to cache the type format after the first use and only have to send the values in subsequent requests.
- Redundancy in data storage is kept to a minimum. For example, in an array of structs, the field names are only specified once in the type spec rather than for each element in the array.

## Use cases
- Use when the structure of the data is complicated. For example, if you are just sending text to be interpreted as text, that can be done easily in almost any environment.
- Use when you plan to have many different values for the type (either many different files storing the same sort of information, or many communications of the same sort of information). This will give you the benefit of being able to keep only a single copy of the type spec.
- Use when there is a lot of repetition in the data. If you don't have any arrays, sets, or maps, you can't really benefit from the cutdown on redundancy.

## Differences from Protocol Buffers
- Types have binary serializations, not just values. (Protocol Buffers requires both the sender and receiver to have `.proto` definition files, which are not designed to be transmitted like values.) This makes storage of complex types much more compact and allows for sending values of types the receiver has not yet seen.
- Types are generated programmatically rather than by reading `.proto` files. This allows for functionality like a function which turns a type into another type that either contains an error message or an instance of the original type.
- This project is designed with downloading data of known types from servers over HTTP in mind. If the client has already received data of the same type, the server only sends the value and the client reads it using its cached type. If the client doesn't know what the type looks like, the server sends it in byte form along with the value and the client caches the type. This way, the type does not need to be specified in the client-side JavaScript and repeated requests are very efficient.
- `structure-bytes` provides a larger set of primitive and recursive types.

## Data types
- Primitive types
	- `Byte` (1-byte signed integer)
	- `Short` (2-byte signed integer)
	- `Int` (4-byte signed integer)
	- `Long` (8-byte signed integer)
	- `BigInt` (a signed integer with arbitrary precision)
	- `FlexInt` (a signed integer from `-(2 ** 52)` to `2 ** 52` with a variable-length representation)
	- `UnsignedByte` (1-byte unsigned integer)
	- `UnsignedShort` (2-byte unsigned integer)
	- `UnsignedInt` (4-byte unsigned integer)
	- `UnsignedLong` (8-byte unsigned integer)
	- `BigUnsignedInt` (an unsigned integer with arbitrary precision)
	- `FlexUnsignedInt` (an unsigned integer below `2 ** 53` with a variable-length representation)
	- `Date` (8-byte unsigned integer representing number of milliseconds since Jan 1, 1970)
	- `Day` (3-byte unsigned integer representing a specific day in history)
	- `Time` (4-byte unsigned integer representing a specific time of day)
	- `Float` (IEEE 32-bit floating-point number)
	- `Double` (IEEE 64-bit floating-point number)
	- `Boolean` (a single true or false value)
	- `BooleanTuple` (a constant-length array of `Boolean`s)
	- `BooleanArray` (a variable-length array of `Boolean`s)
	- `Char` (a single UTF-8 character)
	- `String` (an array of UTF-8 characters that also stores its total byte length)
	- `Octets` (an `ArrayBuffer` (raw binary data))
- Recursive types
	- `Tuple<Type>` (a constant-length array of `Type`s)
	- `Struct` (a fixed collection of up to 255 fields, each with a name (up to 255 bytes long) and a type)
	- `Array<Type>` (a variable-length array of `Type`s)
	- `Set<Type>` (like an `Array`, except creates a set when read)
	- `Map<KeyType, ValueType>` (a mapping of `KeyType` instances to `ValueType` instances)
	- `Enum<Type>` (a fixed set of up to 255 `Type`s; useful when only a small subset of `Type` instances represent possible values, especially with `String`s)
	- `Choice` (a fixed set of up to 255 types that values can take on)
	- `NamedChoice` (a fixed set of up to 255 named types that values can take on, each associated with a constructor)
	- `Recursive<Type>` (a type that can reference itself and be used to serialize circular data structures)
	- `Optional<Type>` (either `null` or an instance of `Type`)
	- `Pointer<Type>` (allows multiple long instances of `Type` with the same bytes to be stored only once)

## Documentation
The `docs` folder is hosted at
[https://calebsander.github.io/structure-bytes](https://calebsander.github.io/structure-bytes/modules/_index_.html).

## Examples
### Type creation
````javascript
const sb = require('structure-bytes');

const personType = new sb.StructType({
	dob: new sb.DateType,
	id: new sb.UnsignedShortType,
	name: new sb.StringType
});
const tribeType = new sb.StructType({
	leader: personType,
	members: new sb.SetType(personType),
	money: new sb.MapType(personType, new sb.FloatType)
});
````
### Converting types and values to binary data
````javascript
const sb = require('structure-bytes');

const personType = new sb.StructType({
	dob: new sb.DateType,
	id: new sb.UnsignedShortType,
	name: new sb.StringType
});
const tribeType = new sb.StructType({
	leader: personType,
	members: new sb.SetType(personType),
	money: new sb.MapType(personType, new sb.FloatType)
});
let typeBuffer = tribeType.toBuffer(); //ArrayBuffer { byteLength: 47 }
console.log(Buffer.from(typeBuffer));
//<Buffer 51 03 06 6c 65 61 64 65 72 51 03 03 64 6f 62 1a 02 69 64 12 04 6e 61 6d 65 41 07 6d 65 6d 62 65 72 73 53 ff 1b 05 6d 6f 6e 65 79 54 ff 24 20>

let louis = {
	dob: new Date(1437592284193),
	id: 9,
	name: 'Louis'
},
garfield = {
	dob: new Date(1437592284194),
	id: 17,
	name: 'Garfield'
};
let value = {
	leader: {
		dob: new Date(1437592284192),
		id: 10,
		name: 'Joe'
	},
	members: new Set().add(louis).add(garfield),
	money: new Map().set(louis, 23.05).set(garfield, -10.07)
};
let valueBuffer = tribeType.valueBuffer(value); //ArrayBuffer { byteLength: 94 }
console.log(Buffer.from(valueBuffer));
//<Buffer 00 00 01 4e b7 2d 6c 20 00 0a 4a 6f 65 00 02 00 00 01 4e b7 2d 6c 21 00 09 4c 6f 75 69 73 00 00 00 01 4e b7 2d 6c 22 00 11 47 61 72 66 69 65 6c 64 00 ... >
````
### Reading from type and value buffers
````javascript
const sb = require('structure-bytes');

//Buffer obtained somehow
let tribeBuffer = new Uint8Array([0x51, 0x03, 0x06, 0x6c, 0x65, 0x61, 0x64, 0x65, 0x72, 0x51, 0x03, 0x03, 0x64, 0x6f, 0x62, 0x1a, 0x02, 0x69, 0x64, 0x12, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x41, 0x07, 0x6d, 0x65, 0x6d, 0x62, 0x65, 0x72, 0x73, 0x53, 0xff, 0x1b, 0x05, 0x6d, 0x6f, 0x6e, 0x65, 0x79, 0x54, 0xff, 0x24, 0x20]);
let type = sb.r.type(tribeBuffer.buffer);
console.log(type);
/*
StructType {
  fields:
   [ { name: 'leader', type: [Object] },
     { name: 'members', type: [Object] },
     { name: 'money', type: [Object] } ] }
*/

//Buffer obtained somehow
let valueBuffer = new Uint8Array([0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x20, 0x00, 0x0a, 0x4a, 0x6f, 0x65, 0x00, 0x02, 0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x21, 0x00, 0x09, 0x4c, 0x6f, 0x75, 0x69, 0x73, 0x00, 0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x22, 0x00, 0x11, 0x47, 0x61, 0x72, 0x66, 0x69, 0x65, 0x6c, 0x64, 0x00, 0x02, 0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x21, 0x00, 0x09, 0x4c, 0x6f, 0x75, 0x69, 0x73, 0x00, 0x41, 0xb8, 0x66, 0x66, 0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x22, 0x00, 0x11, 0x47, 0x61, 0x72, 0x66, 0x69, 0x65, 0x6c, 0x64, 0x00, 0xc1, 0x21, 0x1e, 0xb8]);
console.log(type.readValue(valueBuffer.buffer));
/*
{ leader: { dob: 2015-07-22T19:11:24.192Z, id: 10, name: 'Joe' },
  members:
   Set {
     { dob: 2015-07-22T19:11:24.193Z, id: 9, name: 'Louis' },
     { dob: 2015-07-22T19:11:24.194Z, id: 17, name: 'Garfield' } },
  money:
   Map {
     { dob: 2015-07-22T19:11:24.193Z, id: 9, name: 'Louis' } => 23.05,
     { dob: 2015-07-22T19:11:24.194Z, id: 17, name: 'Garfield' } => -10.07 } }
*/
````
### File I/O
````javascript
const fs = require('fs');
const sb = require('structure-bytes');

let type = new sb.EnumType({
	type: new sb.StringType,
	values: [
		'ON_TIME',
		'LATE',
		'CANCELLED',
		'UNKNOWN'
	]
});
sb.writeType({
	type,
	outStream: fs.createWriteStream('./type')
}, err => {
	sb.readType(fs.createReadStream('./type'), (err, readType) => {
		console.log(readType);
		/*
		EnumType {
			type: StringType {},
			values: [ 'ON_TIME', 'LATE', 'CANCELLED', 'UNKNOWN' ] }
		*/
	});
});
let value = 'CANCELLED';
sb.writeValue({
	type,
	value,
	outStream: fs.createWriteStream('./value')
}, err => {
	sb.readValue({
		type,
		inStream: fs.createReadStream('./value')
	}, (err, value) => {
		console.log(value); //'CANCELLED'
	});
});
sb.writeTypeAndValue({
	type,
	value,
	outStream: fs.createWriteStream('./type-value')
}, err => {
	sb.readTypeAndValue(fs.createReadStream('./type-value'), (err, type, value) => {
		console.log(value); //'CANCELLED'
	});
});
````
### HTTP GET value
Server-side:
````javascript
const http = require('http');
const sb = require('structure-bytes');

let type = new sb.DateType;
http.createServer((req, res) => {
	sb.httpRespond({req, res, type, value: new Date}, err => {
		console.log('Responded');
	});
}).listen(80);
````
Client-side:
````html
<script src = '/structure-bytes/compiled/download.js'></script>
<script>
	//'date' specifies the name of the type being transferred so it can be cached
	sb.download({
		name: 'date',
		url: '/',
		options: {} //optional options to pass to fetch() (e.g. cookies, headers, etc.)
	})
		.then(value =>
			console.log(value.getFullYear()) //2017
		);
</script>
````
### HTTP POST value
Server-side:
````javascript
const http = require('http');
const sb = require('structure-bytes');

http.createServer((req, res) => {
	sb.readValue({type: new sb.FlexUnsignedIntType, inStream: req}, (err, value) => {
		res.end(String(value));
	});
}).listen(80);
````
Client-side:
````html
<script src = '/structure-bytes/compiled/upload.js'></script>
<button onclick = 'upload()'>Click me</button>
<script>
	var clickCount = 0;
	function upload() {
		clickCount++;
		sb.upload({
			type: new sb.FlexUnsignedIntType,
			value: clickCount,
			url: '/click',
			options: {method: 'POST'} //options to pass to fetch(); method 'POST' is required
		})
			.then(response => response.text())
			.then(alert);
	}
</script>
````

## Using with TypeScript
The entire project is written in TypeScript, and declaration files are automatically generated. That means that if you are using TypeScript, the compiler can automatically infer the type of the various values exported from `structure-bytes`. To import the package, use:
````javascript
import * as sb from 'structure-bytes'
````
One of the most useful parts of having typings is that the compiler can automatically infer what types of valus a `Type` can serialize. For example:
````javascript
let type = new sb.StructType({
	abc: new sb.DoubleType,
	def: new sb.MapType(
		new sb.StringType,
		new sb.DayType
	)
})
type.valueBuffer(/*...*/)
/*
If you hover over "valueBuffer", you can see
that it requires the value to be of type:
{ abc: number | string, def: Map<string, Date> }
*/
````
You can even add explicit `VALUE` generics to make the compiler check that your `Type` serializes the correct types of values.
Many non-primitive types (e.g. `ArrayType`, `MapType`, `StructType`) can take either one or two generics.
The first, `VALUE`, specifies the type of values the type can write.
The second, `READ_VALUE`, specifies the type of values the type will read from written values and defaults to `VALUE` if omitted.
Generally the two generics are the same, except in the case of numeric types (which write `number | string` but read `number`) and `OptionalType` (which writes `E | null | undefined` but reads `E | null`).
`READ_VALUE` must be a subset of `VALUE`, so in most cases where you specify the generic it makes sense to restrict `VALUE` to the type of read values and let `READ_VALUE` default to `VALUE`.

With `StructType`:
````typescript
class Car {
	constructor(
		public make: string,
		public model: string,
		public year: number
	) {}
}
let structType = new sb.StructType<Car>({
	make: new sb.StringType,
	model: new sb.StringType,
	year: new sb.UnsignedShortType
})
//The compiler would have complained if one of the fields were missing
//or one of the field's types didn't match the type of the field's values,
//e.g. "make: new sb.BooleanType"
````
If you have transient fields (i.e. they shouldn't be serialized), you can create a separate interface for the fields that should be serialized:
````typescript
interface SerializedCar {
	make: string
	model: string
	year: number
}
class Car implements SerializedCar {
	public id: number //transient field
	constructor(public make: string, public model: string, public year: number) {
		this.id = Math.floor(Math.random() * 1000000)
	}
}
let structType = new sb.StructType<SerializedCar>({
	make: new sb.StringType,
	model: new sb.StringType,
	year: new sb.UnsignedShortType
})
````

With `ChoiceType` (and similarly for `NamedChoiceType`), you can let the type be inferred automatically if each of the possible types writes the same type of values:
````javascript
let type = new sb.ChoiceType([ //Type<number | string, number>
	new sb.ByteType,
	new sb.ShortType,
	new sb.IntType,
	new sb.DoubleType
])
````
However, if the value types are not the same, TypeScript will complain about them not matching, and you should express the union type explicitly:
````typescript
interface RGB {
	r: number
	g: number
	b: number
}
interface HSV {
	h: number
	s: number
	v: number
}
type CSSColor = string

let choiceType = new sb.ChoiceType<RGB | HSV | CSSColor>([
	new sb.StructType<RGB>({
		r: new sb.FloatType,
		g: new sb.FloatType,
		b: new sb.FloatType
	}),
	new sb.StructType<HSV>({
		h: new sb.FloatType,
		s: new sb.FloatType,
		v: new sb.FloatType
	}),
	new sb.StringType
])
````
A `RecursiveType` has no way to infer its value type, so you should always provide the `VALUE` generic:
````typescript
interface Cons<A> {
	head: A
	tail: List<A>
}
interface List<A> {
	list: Cons<A> | null //null for empty list
}

let recursiveType = new sb.RecursiveType<List<string>>('linked-list')
recursiveType.setType(new sb.StructType<List<string>>({
	list: new sb.OptionalType(
		new sb.StructType<Cons<string>>({
			head: new sb.StringType,
			tail: recursiveType
		})
	)
}))
recursiveType.valueBuffer({
	list: {
		head: '1',
		tail: {
			list: {
				head: '2',
				tail: {list: null}
			}
		}
	}
})
````
When reading types from buffers and streams, they will be of type `Type<any>`.
You should specify their value types before using them to write values:
````typescript
let booleanType = new sb.BooleanType
let readType = sb.r.type(booleanType.toBuffer()) //Type<any>
//Will throw a runtime error
readType.valueBuffer('abc')

//vs.

let castReadType: sb.Type<boolean> = sb.r.type(booleanType.toBuffer())
//Will throw a compiler error
castReadType.valueBuffer('abc')
````

It may also sometimes be useful to be more specific about what types of values you want to be able to serialize.
For example, if you want to serialize integer values that will always be represented as numbers (and never in string form), you can force the compiler to error out if you try to serialize a string value with the following:
````typescript
let intType: sb.Type<number> = new sb.IntType
//Now this is valid:
intType.valueBuffer(100)
//But this is not, even though it would be if you omitted the type annotation on intType:
intType.valueBuffer('100')
````

## Binary formats
In the following definitions, `uint8_t` means an 8-bit unsigned integer. `flexInt` means a variable-length unsigned integer with the following format, where `X` represents either `0` or `1`:
- `[0b0XXXXXXX]` stores values from `0` to `2**7 - 1` in their unsigned 7-bit integer representations
- `[0b10XXXXXX, 0bXXXXXXXX]` stores values from `2**7` to `2**7 + 2**14 - 1`, where a value `x` is encoded into the unsigned 14-bit representation of `x - 2**7`
- `[0b110XXXXX, 0bXXXXXXXX, 0bXXXXXXXX]` stores values from `2**7 + 2**14` to `2**7 + 2**14 + 2**21 - 1`, where a value `x` is encoded into the unsigned 21-bit representation of `x - (2**7 + 2**14)`
- and so on, up to 8-byte representations

All numbers are stored in big-endian format.
### Type

The binary format of a type contains a byte identifying the class of the type followed by additional information to describe the specific instance of the type, if necesary.
For example, `new sb.UnsignedIntType` translates into `[0x13]`, and `new sb.StructType({abc: new sb.ByteType, def: new sb.StringType})` translates into:
````javascript
[
	0x51 /*StructType*/,
		2 /*2 fields*/,
			3 /*3 characters in first field's name*/, 0x61 /*a*/, 0x62 /*b*/, 0x63 /*c*/, 0x01 /*ByteType*/,
			3 /*3 characters in second field's name*/, 0x64 /*d*/, 0x65 /*e*/, 0x66 /*f*/, 0x41 /*StringType*/
]
````
If the type has already been written to the buffer, it is also valid to serialize the type as:

- `0xFF`
- `offset` ([position of first byte of `offset` in buffer] - [position of type in buffer]) - `flexInt`

For example:
````javascript
const someType = new sb.TupleType({
	type: new sb.FloatType,
	length: 3
})
const type = new sb.StructType({
	one: someType,
	two: someType
})
//type translates into
[
	0x51 /*StructType*/,
		2 /*2 fields*/,
			3 /*3 characters in first field's name*/, 0x6f /*o*/, 0x6e /*n*/, 0x65 /*e*/,
				0x50 /*TupleType*/,
					0x20 /*FloatType*/,
					3 /*3 floats in the tuple*/,
			3 /*3 characters in second field's name*/, 0x74 /*t*/, 0x77 /*w*/, 0x6f /*o*/,
				0xff, /*type is defined previously*/
					8 /*type is defined 8 bytes before this byte*/
]
````
In the following definitions, `type` means the binary type format.

- `ByteType`: identifier `0x01`
- `ShortType`: identifier `0x02`
- `IntType`: identifier `0x03`
- `LongType`: identifier `0x04`
- `BigIntType`: identifier `0x05`
- `FlexIntType`: identifier `0x07`
- `UnsignedByteType`: identifier `0x11`
- `UnsignedShortType`: identifier `0x12`
- `UnsignedIntType`: identifier `0x13`
- `UnsignedLongType`: identifier `0x14`
- `BigUnsignedIntType`: identifier `0x15`
- `FlexUnsignedIntType`: identifier `0x17`
- `DateType`: identifier `0x1A`
- `DayType`: identifier `0x1B`
- `TimeType`: identifier `0x1C`
- `FloatType`: identifier `0x20`
- `DoubleType`: identifier `0x21`
- `BooleanType`: identifier `0x30`
- `BooleanTupleType`: identifier `0x31`, payload:
	- `length` - `uint8_t`
- `BooleanArrayType`: identifier `0x32`
- `CharType`: identifier `0x40`
- `StringType`: identifier `0x41`
- `OctetsType`: identifier `0x42`
- `TupleType`: identifier `0x50`, payload:
	- `elementType` - `type`
	- `length` - `uint8_t`
- `StructType`: identifier `0x51`, payload:
	- `fieldCount` - `uint8_t`
	- `fieldCount` instances of `field`:
		- `nameLength` - `uint8_t`
		- `name` - a UTF-8 string containing `nameLength` bytes
		- `fieldType` - `type`
- `ArrayType`: identifier `0x52`, payload:
	- `elementType` - `type`
- `SetType`: identifier `0x53`, payload identical to `ArrayType`:
	- `elementType` - `type`
- `MapType`: identifier `0x54`, payload:
	- `keyType` - `type`
	- `valueType` - `type`
- `EnumType`: identifier `0x55`, payload:
	- `valueType` - `type`
	- `valueCount` - `uint8_t`
	- `valueCount` instances of `value`:
		- `value` - a value that conforms to `valueType`
- `ChoiceType`: identifier `0x56`, payload:
	- `typeCount` - `uint8_t`
	- `typeCount` instances of `possibleType`:
		- `possibleType` - `type`
- `NamedChoiceType`: identifier `0x58`, payload:
	- `typeCount` - `uint8_t`
	- `typeCount` instances of `possibleType`:
		- `typeNameLength` - `uint8_t`
		- `typeName` - a UTF-8 string containing `typeNameLength` bytes
		- `typeType` - `type`
- `RecursiveType`: identifier `0x57`, payload:
	- `recursiveID` (an identifier unique to this recursive type in this type buffer) - `flexInt`
	- If this is the first instance of this recursive type in this buffer:
		- `recursiveType` (the type definition of this type) - `type`
- `OptionalType`: identifier `0x60`, payload:
	- `typeIfNonNull` - `type`
- `PointerType`: identifier `0x70`, payload:
	- `targetType` - `type`

### Value

- `ByteType`: 1-byte integer
- `ShortType`: 2-byte integer
- `IntType`: 4-byte integer
- `LongType`: 8-byte integer
- `BigIntType`:
	- `byteCount` - `flexInt`
	- `number` - `byteCount`-byte integer
- `FlexIntType`: `flexInt` of `value * 2` if `value` is non-negative, `-2 * value - 1` if `value` is negative
- `UnsignedByteType`: 1-byte unsigned integer
- `UnsignedShortType`: 2-byte unsigned integer
- `UnsignedIntType`: 4-byte unsigned integer
- `UnsignedLongType`: 8-byte unsigned integer
- `BigUnsignedIntType`:
	- `byteCount` - `flexInt`
	- `number` - `byteCount`-byte unsigned integer
- `FlexUnsignedIntType`: `flexInt`
- `DateType`: 8-byte unsigned integer storing milliseconds in [Unix time](https://en.wikipedia.org/wiki/Unix_time)
- `DayType`: 3-byte unsigned integer storing days since the [Unix time](https://en.wikipedia.org/wiki/Unix_time) epoch
- `TimeType`: 4-byte unsigned integer storing milliseconds since the start of the day
- `FloatType`: single precision (4-byte) [IEEE floating point](https://en.wikipedia.org/wiki/IEEE_floating_point)
- `DoubleType`: double precision (8-byte) [IEEE floating point](https://en.wikipedia.org/wiki/IEEE_floating_point)
- `BooleanType`: 1-byte value, either `0x00` for `false` or `0xFF` for `true`
- `BooleanTupleType`: `ceil(length / 8)` bytes, where the `n`th boolean is stored at the `(n % 8)`th MSB (`0`-indexed) of the `floor(n / 8)`th byte (`0`-indexed)
- `BooleanArrayType`:
	- `length` - `flexInt`
	- `booleans` - `ceil(length / 8)` bytes, where the `n`th boolean is stored at the `(n % 8)`th MSB (`0`-indexed) of the `floor(n / 8)`th byte (`0`-indexed)
- `CharType`: UTF-8 codepoint (somewhere between 1 and 4 bytes long)
- `StringType`:
	- `string` - a UTF-8 string of any length not containing `'\0'`
	- `0x00` to mark the end of the string
- `OctetsType`:
	- `length` - `flexInt`
	- `octets` - `length` bytes
- `TupleType`:
	- `length` values serialized by `elementType`
- `StructType`:
	- For each field in order of declaration in the type format:
		- The field's value serialized by `fieldType`
- `ArrayType`:
	- `length` - `flexInt`
	- `length` values serialized by `elementType`
- `SetType`:
	- `size` - `flexInt`
	- `size` values serialized by `elementType`
- `MapType`:
	- `size` - `flexInt`
	- `size` instances of `keyValuePair`:
		- `key` - value serialized by `keyType`
		- `value` - value serialized by `valueType`
- `EnumType`:
	- `index` of value in values array - `uint8_t`
- `ChoiceType`:
	- `index` of type in possible types array - `uint8_t`
	- `value` - value serialized by specified type
- `NamedChoiceType`:
	- `index` of type in possible types array - `uint8_t`
	- `value` - value serialized by specified type
- `RecursiveType`:
	- `valueNotYetWrittenInBuffer` - byte containing either `0x00` or `0xFF`
	- If `valueNotYetWrittenInBuffer`:
		- `value` - value serialized by `recursiveType`
	- Else:
		- `offset` ([position of first byte of `offset` in buffer] - [position of `value` in buffer]) - `flexInt`
- `OptionalType`:
	- `valueIsNonNull` - byte containing either `0x00` or `0xFF`
	- If `valueIsNonNull`:
		- `value` - value serialized by `typeIfNonNull`
- `PointerType`:
	- `offset` - `flexInt`:
		- If this is the first instance of these value bytes in the write buffer, then `0`
		- Otherwise, ([position of first byte of `offset`] - [position of first byte of `offset` in the last instance of these value bytes])
	- If `offset` is `0` (i.e. this is the first instance):
		- Value serialized by `targetType`

## Versioning
Versions will be of the form `x.y.z`. They are in the `semver` format:

- `x` is the major release; changes to it represent significant or breaking changes to the API, or to the type or value binary specification.
- `y` is the minor release; changes to it represent new features that do not break backwards compatibility.
- `z` is the patch release; changes to it represent bug fixes that do not change the documented API.

## Testing
To test the Node.js code, run `npm test`.
To test the HTTP transaction code, run `node client-test/server.js` and open `localhost:8080` in your browser. Open each link in a new page. `Upload` and `Download` should each alert `Success`, while `Upload & Download` should alert `Upload: Success` and `Download: Success`.

_Caleb Sander, 2017_