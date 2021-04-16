# structure-bytes
A TypeScript library for efficient data serialization, achieved by separating data structure from their values and storing each in compact binary formats.

[![npm Version](https://img.shields.io/npm/v/structure-bytes.svg)](https://www.npmjs.com/package/structure-bytes)
[![Build Status](https://travis-ci.org/calebsander/structure-bytes.svg?branch=master)](https://travis-ci.org/calebsander/structure-bytes)
[![Coverage Status](https://coveralls.io/repos/github/calebsander/structure-bytes/badge.svg?branch=master)](https://coveralls.io/github/calebsander/structure-bytes?branch=master)
[![Dependencies](https://david-dm.org/calebsander/structure-bytes/status.svg)](https://david-dm.org/calebsander/structure-bytes)
[![Dev Dependencies](https://david-dm.org/calebsander/structure-bytes/dev-status.svg)](https://david-dm.org/calebsander/structure-bytes?type=dev)

## Concept
Most modern data serialization formats fall into one of two categories:

- Formats like JSON which can represent a wide range of simple and compound data types. Serialized values in these formats implicitly serialize their type so the deserializer doesn't need knowledge of the type.
- Formats like MP3 or PNG which represent one specific data type, such as a song or image. The serializer and deserializer must both know the file format in order to communicate.

The aim of this project is to store values with the flexibility of JSON but the byte efficiency of dedicated formats.
To accomplish this, custom "types" are constructed, implicitly defining binary serialization formats for specific categories of values.
Types are defined from a rich set of primitive and compound types (see [Data Types](#data-types)).
There is a fixed (universal) serialization format for types, and each type defines a serialization format for its values.
`structure-bytes` reduces the number of bytes needed to serialize values in several ways in comparison to JSON:

- Types and values are each serialized in binary formats with far less redundancy than JSON's text-based formats. For example, serializing a 32-bit signed integer in JSON can take up to 11 characters, whereas it requires only 4 bytes when serialized by `sb.IntType`.
- JSON does not require each value in an array or dictionary to have the same type, which results in highly redundant serializations of collections. `structure-bytes` serializes the type of a collection's elements as part of the type rather than the value, so it isn't repeated.
- One type can be used to serialize many different values. For example, when sending multiple values of the same type across a network, the type can sent along with the first value and only values need to be sent afterwards.

This project is somewhat similar to Google's [Protocol Buffers](https://developers.google.com/protocol-buffers/), but was not designed to match its functionality.

## Use cases

- Use when the structure of the data is complicated. For example, if you are serializing plaintext, this can easily be accomplished without redundancy by writing to files or sockets.
- Use when there is a lot of repetition in the data. If you don't have any arrays, sets, or maps, there is less redundancy for `structure-bytes` to eliminate.
- Use when serializing many values for the type (e.g. many files storing the same type of value, or many communications of the same type). This will give you the benefit of being able to keep only a single copy of the type spec.

## Differences from Protocol Buffers

- Types have binary serializations, not just values. (Protocol Buffers requires both the serializer and deserializer to have `.proto` definition files, which are not designed to be transmitted like values.) This compactly stores complex types and allows values to be written along with their types so they can be read without knowing their types beforehand.
- Types are generated programmatically rather than by reading `.proto` files. This allows, for example, for a function which turns a type into another type that either contains an error message or an instance of the original type.
- This project is designed with downloading data over HTTP in mind. If the client has already received values of the same type, the server only sends the value and the client reads it using its cached type. If the client doesn't know the type, the server serializes it along with the value and the client caches the type. This way, the type does not need to be specified in the client-side JavaScript and repeated requests to the same endpoint are very efficient.
- `structure-bytes` provides a larger set of primitive and compound types.

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
	- `Date` (8-byte signed integer representing number of milliseconds since Jan 1, 1970)
	- `Day` (3-byte signed integer representing a specific day in history)
	- `Time` (4-byte unsigned integer representing a specific time of day)
	- `Float` (IEEE 32-bit floating-point number)
	- `Double` (IEEE 64-bit floating-point number)
	- `Boolean` (a single true or false value)
	- `BooleanTuple` (a constant-length array of `Boolean`s)
	- `BooleanArray` (a variable-length array of `Boolean`s)
	- `Char` (a single UTF-8 character)
	- `String` (UTF-8-encoded text)
	- `Octets` (an `ArrayBuffer` (raw binary data))
- Compound/recursive types
	- `Tuple<Type>` (a constant-length array of `Type`s)
	- `Struct` (an object with a fixed set of fields, each with a fixed name and type)
	- `Array<Type>` (a variable-length array of `Type`s)
	- `Set<Type>` (like an `Array`, except creates a set when read)
	- `Map<KeyType, ValueType>` (a mapping of `KeyType` instances to `ValueType` instances)
	- `Enum<Type>` (a fixed set of `Type`s; useful when only a small subset of `Type` instances represent possible values, especially with `String`s)
	- `Choice` (a fixed set of types that values can take on)
	- `Recursive<Type>` (a type that can reference itself and be used to serialize circular data structures)
	- `Singleton<Type>` (a type that serializes only one value)
	- `Optional<Type>` (either `null` or `undefined` or an instance of `Type`)
	- `Pointer<Type>` (allows multiple instances of `Type` with the same serialization to be stored only once)

## Documentation
The `docs` folder is hosted at
[calebsander.github.io/structure-bytes](https://calebsander.github.io/structure-bytes/modules/index.html).

## Examples

### Type creation
````javascript
const sb = require('structure-bytes')

const colorType = new sb.TupleType({
	type: new sb.UnsignedByteType,
	length: 3
})
const routeAttributesType = new sb.StructType({
	color: colorType,
	description: new sb.PointerType(new sb.StringType),
	direction_names: new sb.PointerType(
		new sb.ArrayType(new sb.StringType)
	),
	long_name: new sb.StringType,
	text_color: colorType,
	type: new sb.UnsignedByteType
})
const routesType = new sb.ArrayType(
	new sb.StructType({
		id: new sb.StringType,
		attributes: routeAttributesType
	})
)
````

### Converting types and values to binary data
````javascript
const sb = require('structure-bytes')

const colorType = new sb.TupleType({
	type: new sb.UnsignedByteType,
	length: 3
})
const routeAttributesType = new sb.StructType({
	color: colorType,
	description: new sb.PointerType(new sb.StringType),
	direction_names: new sb.PointerType(
		new sb.ArrayType(new sb.StringType)
	),
	long_name: new sb.StringType,
	text_color: colorType,
	type: new sb.UnsignedByteType
})
const routesType = new sb.ArrayType(
	new sb.StructType({
		id: new sb.StringType,
		attributes: routeAttributesType
	})
)
const typeBuffer = routesType.toBuffer()
// ArrayBuffer { byteLength: 92 }
console.log(Buffer.from(typeBuffer))
// <Buffer 52 51 02 0a 61 74 74 72 69 62 75 74 65 73 51 06 05 63 6f 6c 6f 72 50 11 03 0b 64 65 73 63 72 69 70 74 69 6f 6e 70 41 0f 64 69 72 65 63 74 69 6f 6e 5f ... >

const toRGB = hex => [
	parseInt(hex.slice(0, 2), 16),
	parseInt(hex.slice(2, 4), 16),
	parseInt(hex.slice(4, 6), 16)
]
fetch('https://api-v3.mbta.com/routes?filter[type]=0,1')
	.then(res => res.json())
	.then(({data}) => {
		const routes = data.map(({id, attributes}) => {
			delete attributes.short_name
			delete attributes.sort_order
			attributes.color = toRGB(attributes.color)
			attributes.text_color = toRGB(attributes.text_color)
			return {id, attributes}
		})
		const valueBuffer = routesType.valueBuffer(routes)
		// ArrayBuffer { byteLength: 306 }
		// (for comparison, JSON.stringify(routes).length == 1498)
	})
````

### Reading from type and value buffers
````javascript
const sb = require('structure-bytes')

// Buffer obtained somehow
const typeBuffer = new Uint8Array([0x50, 0x11, 0x03]).buffer
const type = sb.r.type(typeBuffer)
console.log(type)
// TupleType { type: UnsignedByteType {}, length: 3 }

// Buffer obtained somehow
const valueBuffer = new Uint8Array([0x00, 0x80, 0xFF]).buffer
console.log(type.readValue(valueBuffer))
// [ 0, 128, 255 ]
````

### File I/O
The I/O functions are implemented with callbacks, but can all be used with [`util.promisify()`](https://nodejs.org/api/util.html#util_util_promisify_original) if you prefer to use `Promise`s instead.
See the documentation for examples.

I recommend the file extensions `.sbt` for a serialized type, `.sbv` for a serialized value, and `.sbtv` for a serialized type and value.
````javascript
const fs = require('fs')
const sb = require('structure-bytes')

const type = new sb.EnumType({
	type: new sb.StringType,
	values: [
		'ON_TIME',
		'LATE',
		'CANCELLED',
		'UNKNOWN'
	]
})
sb.writeType({
	type,
	outStream: fs.createWriteStream('status.sbt')
}, err => {
	sb.readType(fs.createReadStream('status.sbt'), (err, readType) =>
		console.log(readType)
		/*
		EnumType {
			type: StringType {},
			values: [ 'ON_TIME', 'LATE', 'CANCELLED', 'UNKNOWN' ] }
		*/
	)
})

const value = 'CANCELLED'
sb.writeValue({
	type,
	value,
	outStream: fs.createWriteStream('status.sbv')
}, err => {
	sb.readValue({
		type,
		inStream: fs.createReadStream('status.sbv')
	}, (err, value) =>
		console.log(value)
		// 'CANCELLED'
	)
})

sb.writeTypeAndValue({
	type,
	value,
	outStream: fs.createWriteStream('status.sbtv')
}, err => {
	sb.readTypeAndValue(fs.createReadStream('status.sbtv'), (err, type, value) =>
		console.log(value)
		// 'CANCELLED'
	)
})
````

### HTTP GET value
Server-side:
````javascript
const http = require('http')
const sb = require('structure-bytes')

const type = new sb.DateType
http.createServer((req, res) => {
	sb.httpRespond({req, res, type, value: new Date}, err =>
		console.log('Responded')
	)
}).listen(80)
````
Client-side:
````html
<script src = '/structure-bytes/compiled/download.js'></script>
<script>
	// 'date' specifies the name of the type being transferred so it can be cached for future requests
	sb.download({
		name: 'date',
		url: '/',
		options: {} // optional options to pass to fetch() (e.g. cookies, headers, etc.)
	})
		.then(value =>
			console.log(value.getFullYear())
			// 2017
		)
</script>
````

### HTTP POST value
Server-side:
````javascript
const http = require('http')
const sb = require('structure-bytes')

http.createServer((req, res) => {
	sb.readValue({type: new sb.FlexUnsignedIntType, inStream: req}, (err, value) => {
		res.end(String(value))
	})
}).listen(80)
````
Client-side:
````html
<script src = '/structure-bytes/compiled/upload.js'></script>
<button onclick = 'upload()'>Click me</button>
<script>
	let clickCount = 0
	function upload() {
		clickCount++
		sb.upload({
			type: new sb.FlexUnsignedIntType,
			value: clickCount,
			url: '/click',
			options: {method: 'POST'} // options to pass to fetch(); method 'POST' is required
		})
			.then(response => response.text())
			.then(alert)
	}
</script>
````

## Using with TypeScript
The entire project is written in TypeScript and declaration files are automatically generated. That means that if you are using TypeScript, the compiler can automatically infer the type of the various values exported from `structure-bytes`. To import the package, use:
````javascript
import * as sb from 'structure-bytes'
````
The typings allow the compiler to automatically infer what types of values a `Type` can serialize. For example:
````javascript
const type = new sb.StructType({
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
You can also add explicit `VALUE` generics to make the compiler check that your `Type` serializes the correct types of values.
Many non-primitive types (e.g. `ArrayType`, `MapType`, `StructType`) can take either one or two generics.
The first, `VALUE`, specifies the type of values the type can serialize.
The second, `READ_VALUE`, specifies the type of values the type will deserialize and defaults to `VALUE` if omitted.
`READ_VALUE` must extend `VALUE`.
Generally the two generics are the same, except in the case of numeric types (which write `number | string` but read `number`) and `OptionalType` (which writes `E | null | undefined` but reads `E | null`).

With `StructType`:
````typescript
class Car {
	constructor(
		public make: string,
		public model: string,
		public year: number
	) {}
}
const carType = new sb.StructType<Car>({
	make: new sb.StringType,
	model: new sb.StringType,
	year: new sb.UnsignedShortType
})
// The compiler would have complained if one of the fields were missing
// or one of the field's types didn't match the type of the field's values,
// e.g. "make: new sb.BooleanType"
````
If you have transient fields (i.e. they shouldn't be serialized), you can create a separate interface for the fields that should be serialized:
````typescript
interface SerializedCar {
	make: string
	model: string
	year: number
}
class Car implements SerializedCar {
	public id: number // transient field
	constructor(public make: string, public model: string, public year: number) {
		this.id = Math.floor(Math.random() * 1e6)
	}
}
const carType = new sb.StructType<SerializedCar>({
	make: new sb.StringType,
	model: new sb.StringType,
	year: new sb.UnsignedShortType
})
````

With `ChoiceType`, you can let the type be inferred automatically if each of the possible types writes the same type of values:
````javascript
const choiceType = new sb.ChoiceType([ // Type<number | string, number>
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

const choiceType = new sb.ChoiceType<RGB | HSV | CSSColor>([
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
	list: Cons<A> | null // null for empty list
}

const recursiveType = new sb.RecursiveType<List<string>>('linked-list')
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
const booleanType = new sb.BooleanType
const readType = sb.r.type(booleanType.toBuffer()) // Type<any>
// Will throw a runtime error
readType.valueBuffer('abc')

//vs.

const castReadType: sb.Type<boolean> = sb.r.type(booleanType.toBuffer())
// Will throw a compiler error
castReadType.valueBuffer('abc')
````

It may also sometimes be useful to be more specific about what types of values you want to be able to serialize.
For example, if you want to serialize integer values that will always be represented as numbers (and never in string form), you can force the compiler to error out if you try to serialize a string value with the following:
````typescript
const intType: sb.Type<number> = new sb.IntType
// Now this is valid:
intType.valueBuffer(100)
// But this is not, even though it would be if you omitted the type annotation on intType:
intType.valueBuffer('100')
````

## Binary formats
In the following definitions, `flexInt` means a variable-length unsigned integer with the following format, where `X` represents either `0` or `1`:
- `[0b0XXXXXXX]` stores values from `0` to `2**7 - 1` in their unsigned 7-bit integer representations
- `[0b10XXXXXX, 0bXXXXXXXX]` stores values from `2**7` to `2**7 + 2**14 - 1`, where a value `x` is encoded into the unsigned 14-bit representation of `x - 2**7`
- `[0b110XXXXX, 0bXXXXXXXX, 0bXXXXXXXX]` stores values from `2**7 + 2**14` to `2**7 + 2**14 + 2**21 - 1`, where a value `x` is encoded into the unsigned 21-bit representation of `x - (2**7 + 2**14)`
- and so on, up to 8-byte representations

All numbers are stored in big-endian format.
### Type

The binary format of a type contains a byte identifying the class of the type followed by additional information to describe the type, if necessary.
For example, `new sb.UnsignedIntType` translates into `[0x13]`, and `new sb.StructType({abc: new sb.ByteType, def: new sb.StringType})` translates into:
````javascript
[
	0x51 /*StructType*/,
		2 /*2 fields*/,
			/*first field's name*/, 0x61 /*a*/, 0x62 /*b*/, 0x63 /*c*/, 0, 0x01 /*ByteType*/,
			/*second field's name*/, 0x64 /*d*/, 0x65 /*e*/, 0x66 /*f*/, 0, 0x41 /*StringType*/
]
````
If the type has already been written to the buffer, it is also valid to serialize the type as:

- `0xFF`
- `offset` ([position of `0xFF` in buffer] - [position of type in buffer]) - `flexInt`

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
// type serializes to
[
	0x51 /*StructType*/,
		2 /*2 fields*/,
			/*first field's name*/, 0x6f /*o*/, 0x6e /*n*/, 0x65 /*e*/, 0,
				0x50 /*TupleType*/,
					0x20 /*FloatType*/,
					3 /*3 floats in the tuple*/,
			/*second field's name*/, 0x74 /*t*/, 0x77 /*w*/, 0x6f /*o*/, 0,
				0xff, /*type is defined previously*/
					7 /*type is defined 7 bytes before the 0xff byte*/
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
	- `length` - `flexInt`
- `BooleanArrayType`: identifier `0x32`
- `CharType`: identifier `0x40`
- `StringType`: identifier `0x41`
- `OctetsType`: identifier `0x42`
- `TupleType`: identifier `0x50`, payload:
	- `elementType` - `type`
	- `length` - `flexInt`
- `StructType`: identifier `0x51`, payload:
	- `fieldCount` - `flexInt`
	- `fieldCount` instances of `field`:
		- `name` - a serialized `StringType` value
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
	- `valueCount` - `flexInt`
	- `valueCount` instances of `value`:
		- `value` - a value that conforms to `valueType`
- `ChoiceType`: identifier `0x56`, payload:
	- `typeCount` - `flexInt`
	- `typeCount` instances of `possibleType`:
		- `possibleType` - `type`
- `RecursiveType`: identifier `0x57`, payload:
	- `recursiveID` (an identifier unique to this recursive type in this type buffer) - `flexInt`
	- If this is the first instance of this recursive type in this buffer:
		- `recursiveType` (the type definition of this type) - `type`
- `SingletonType`: identifier `0x59`, payload:
	- `valueType` - `type`
	- `value` - a value that conforms to `valueType`
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
- `DateType`: 8-byte signed integer storing milliseconds in [Unix time](https://en.wikipedia.org/wiki/Unix_time)
- `DayType`: 3-byte signed integer storing days since the [Unix time](https://en.wikipedia.org/wiki/Unix_time) epoch
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
	- `index` of value in values array - `flexInt`
- `ChoiceType`:
	- `index` of type in possible types array - `flexInt`
	- `value` - value serialized by specified type
- `RecursiveType`:
	- `valueNotYetWrittenInBuffer` - byte containing either `0x00` or `0xFF`
	- If `valueNotYetWrittenInBuffer`:
		- `value` - value serialized by `recursiveType`
	- Else:
		- `offset` ([position of first byte of `offset` in buffer] - [position of `value` in buffer]) - `flexInt`
- `SingletonType`:
	- No value bytes
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