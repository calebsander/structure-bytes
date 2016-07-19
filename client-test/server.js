const assert = require(__dirname + '/../lib/assert.js');
const fs = require('fs');
const http = require('http');
const sb = require(__dirname + '/../index.js');

const type = new sb.ArrayType(
	new sb.StructType({
		name: new sb.StringType(),
		id: new sb.UnsignedShortType()
	})
);

const PORT = 8080;
http.createServer((req, res) => {
	if (req.url === '/uploadtest') {
		sb.readValue({inStream: req, type}, (err, value) => {
			if (err) {
				res.end('Error occurred')
				console.log(err);
			}
			else {
				assert.equal(value, [{name: 'John', id: 2}, {name: 'Jane', id: 10}]);
				console.log('Got upload');
				res.end('Success');
			}
		});
	}
	else {
		if (req.url === '/') req.url = '/client-test/files/index.html';
		const readStream = fs.createReadStream(__dirname + '/..' + req.url);
		readStream.on('error', (e) => {
			console.log(e);
			res.writeHead(404);
			res.end('Error occurred');
		});
		readStream.pipe(res);
	}
}).listen(PORT);
console.log('Listening on port ' + String(PORT));