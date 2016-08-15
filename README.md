# structure-bytes
A NodeJS library for making more efficient data transfers by separating the structure from the values and efficiently storing each as byte arrays.

[![npm](https://img.shields.io/npm/v/structure-bytes.svg)](https://www.npmjs.com/package/structure-bytes)
[![Build Status](https://travis-ci.org/calebsander/structure-bytes.svg?branch=master)](https://travis-ci.org/calebsander/structure-bytes)
[![Coverage Status](https://coveralls.io/repos/github/calebsander/structure-bytes/badge.svg?branch=master)](https://coveralls.io/github/calebsander/structure-bytes?branch=master)

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
- Types are generated programmatically rather than by reading `.proto` files. This allows for functionality like a function which turns a type into another type that either contains an error message or an instance of the original type.
- This project is designed with downloading data of known types from servers over HTTP in mind. If the client has already received data of the same type, the server only sends the value and the client reads it using its cached type. If the client doesn't know what the type looks like, the server sends it in byte form along with the value and the client caches the type. This way, the type does not need to be specified in the client-side JavaScript and repeated requests are very efficient.

## Data types
- Primitive types
	- `Byte` (1-byte signed integer)
	- `Short` (2-byte signed integer)
	- `Int` (4-byte signed integer)
	- `Long` (8-byte signed integer)
	- `BigInt` (a signed integer with up to 65535 bytes of precision)
	- `UnsignedByte` (1-byte unsigned integer)
	- `UnsignedShort` (2-byte unsigned integer)
	- `UnsignedInt` (4-byte unsigned integer)
	- `UnsignedLong` (8-byte unsigned integer)
	- `BigUnsignedInt` (an unsigned integer with up to 65535 bytes of precision)
	- `Date` (8-byte unsigned integer representing number of milliseconds since Jan 1, 1970)
	- `Float` (IEEE 32-bit floating-point number)
	- `Double` (IEEE 64-bit floating-point number)
	- (planned) `BigFloat` (16-bit exponent and up to 256 bytes of precision)
	- `Boolean` (a single true or false value)
	- `BooleanTuple` (a constant-length array of `Boolean`s)
	- `BooleanArray` (a variable-length array of `Boolean`s)
	- `Char` (a single UTF-8 character)
	- `String` (an array of UTF-8 characters that also stores its total byte length)
	- `Octets` (a `Buffer` (raw binary data))
- Recursive types
	- `Tuple<Type>` (a constant-length array of `Type`s)
	- `Struct` (a fixed collection of up to 255 fields, each with a name (up to 255 bytes long) and a type)
	- `Array<Type>` (a variable-length array of `Type`s)
	- `Set<Type>` (like an `Array`, except creates a set when read)
	- `Map<KeyType, ValueType>` (a mapping of `KeyType` instances to `ValueType` instances)
	- `Enum<Type>` (a fixed set of up to 255 `Type`s; useful when only a small subset of `Type` instances represent possible values, especially with `String`s)
	- `Choice` (a fixed set of up to 255 types that values can take on)
	- `Optional<Type>` (either `null` or an instance of `Type`)
	- `Pointer<Type>` (allows multiple long instances of `Type` with the same bytes to be stored only once)

## Documentation
The `doc` folder is hosted at https://calebsander.github.io/structure-bytes/doc/.

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
### Converting types and values to `Buffer`s
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

console.log(tribeType.toBuffer());
//<Buffer 51 03 06 6c 65 61 64 65 72 51 03 03 64 6f 62 15 02 69 64 12 04 6e 61 6d 65 41 07 6d 65 6d 62 65 72 73 53 ff 00 1b 05 6d 6f 6e 65 79 54 ff 00 25 20>

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
console.log(tribeType.valueBuffer(value));
//<Buffer 00 00 01 4e b7 2d 6c 20 00 0a 4a 6f 65 00 00 00 00 02 00 00 01 4e b7 2d 6c 21 00 09 4c 6f 75 69 73 00 00 00 01 4e b7 2d 6c 22 00 11 47 61 72 66 69 65 ... >
````
### Reading from type and value `Buffer`s
````javascript
const sb = require('structure-bytes');

//Buffer obtained somehow
let tribeBuffer = Buffer.from([0x51, 0x03, 0x06, 0x6c, 0x65, 0x61, 0x64, 0x65, 0x72, 0x51, 0x03, 0x03, 0x64, 0x6f, 0x62, 0x15, 0x02, 0x69, 0x64, 0x12, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x41, 0x07, 0x6d, 0x65, 0x6d, 0x62, 0x65, 0x72, 0x73, 0x53, 0xff, 0x00, 0x1b, 0x05, 0x6d, 0x6f, 0x6e, 0x65, 0x79, 0x54, 0xff, 0x00, 0x25, 0x20]);
let type = sb.r.type(tribeBuffer);
console.log(type);
/*
StructType {
  fields:
   [ { name: 'leader', type: [Object] },
     { name: 'members', type: [Object] },
     { name: 'money', type: [Object] } ] }
*/

//Buffer obtained somehow
let buffer = Buffer.from([0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x20, 0x00, 0x0a, 0x4a, 0x6f, 0x65, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x21, 0x00, 0x09, 0x4c, 0x6f, 0x75, 0x69, 0x73, 0x00, 0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x22, 0x00, 0x11, 0x47, 0x61, 0x72, 0x66, 0x69, 0x65, 0x6c, 0x64, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x21, 0x00, 0x09, 0x4c, 0x6f, 0x75, 0x69, 0x73, 0x00, 0x41, 0xb8, 0x66, 0x66, 0x00, 0x00, 0x01, 0x4e, 0xb7, 0x2d, 0x6c, 0x22, 0x00, 0x11, 0x47, 0x61, 0x72, 0x66, 0x69, 0x65, 0x6c, 0x64, 0x00, 0xc1, 0x21, 0x1e, 0xb8]);
console.log(sb.r.value({type, buffer}));
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
}, (err) => {
	sb.readType(fs.createReadStream('./type'), (err, readType) => {
		console.log(type.equals(readType)); //true
	});
});
let value = 'CANCELLED';
sb.writeValue({
	type,
	value,
	outStream: fs.createWriteStream('./value')
}, (err) => {
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
}, (err) => {
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

let type = new sb.DateType();
http.createServer((req, res) => {
	sb.httpRespond({req, res, type, value: new Date()}, (err) => {
		console.log('Responded');
	});
}).listen(80);
````
Client-side:
````html
<script src = '/structure-bytes/compiled/jquery.js'></script>
<script src = '/structure-bytes/compiled/download.js'></script>
<script>
	//'date' specifies the name of the type being transferred so it can be cached
	sb.download('date', {
		url: '/date',
		success: function(value) {
			console.log(value.getFullYear()); //2016
		}
	});
</script>
````
### HTTP POST value
Server-side:
````javascript
const http = require('http');
const sb = require('structure-bytes');

let type = new sb.DateType();
http.createServer((req, res) => {
	sb.readValue({type: new sb.UnsignedIntType, inStream: req}, (err, value) => {
		res.end(String(value));
	});
}).listen(80);
````
Client-side:
````html
<script src = './node_modules/structure-bytes/compiled/jquery.js'></script>
<script src = './node_modules/structure-bytes/compiled/upload.js'></script>
<button>Click me</button>
<script>
	var clickCount = 0;
	$('button').click(function() {
		clickCount++;
		sb.upload({
			type: new sb.UnsignedIntType,
			value: clickCount
		}, {
			url: '/click',
			type: 'POST',
			dataType: 'text',
			success: function(response) {
				alert(response); //alerts '1', '2', etc.
			}
		});
	});
</script>
````

## Versioning
Versions will be of the form `x.y.z`.
`x` is the major release; changes to it represent significant or breaking changes to the API. Before the full release, it was `0`.
`y` is the minor release; changes to it represent bug-fixing, non-breaking releases.
`z` is the version of the type and value specification, which is independent of the API version. It should match the version set in `config.js`.

## Testing
To test the NodeJS code, run `npm test`.
To test the HTTP transaction code, run `node client-test/server.js` and open `localhost:8080` in your browser. Open each link in a new page and each page should alert `Success`.

_Caleb Sander, 2016_