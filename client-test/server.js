/*eslint-disable no-console*/
const assert = require('../lib/assert')
const fs = require('fs')
const http = require('http')
const sb = require('../index')

const type = new sb.ArrayType(
	new sb.StructType({
		name: new sb.StringType,
		id: new sb.UnsignedShortType
	})
)
const downloadType = new sb.ArrayType(
	new sb.StructType({
		name: new sb.StringType,
		id: new sb.PointerType(new sb.UnsignedShortType)
	})
)
const VALUE = [{name: 'John', id: 2}, {name: 'Jane', id: 10}]

const PORT = 8080
http.createServer((req, res) => {
	if (req.url === '/uploadtest') {
		sb.readValue({inStream: req, type}, (err, value) => {
			if (err) {
				res.end('Error occurred')
				console.log(err)
			}
			else {
				assert.equal(value, VALUE)
				console.log('Got upload')
				res.end('Success')
			}
		})
	}
	else if (req.url.startsWith('/downloadtest')) {
		sb.httpRespond({req, res, type: downloadType, value: VALUE})
		console.log('Sent download')
	}
	else {
		if (req.url === '/') req.url = '/client-test/files/index.html'
		const readStream = fs.createReadStream(__dirname + '/..' + req.url)
		readStream.on('error', err => {
			console.log(err)
			res.writeHead(404)
			res.end('Error occurred')
		})
		readStream.pipe(res)
	}
}).listen(PORT)
console.log('Listening on port ' + String(PORT))