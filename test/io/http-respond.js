/*eslint-disable no-undef*/
const http = require('http');
const zlib = require('zlib');

const port = 8080;
let type = new t.DateType;

let lastValue;
let server = http.createServer((req, res) => {
	lastValue = new Date();
	io.httpRespond({req, res, type, value: lastValue}, (err) => {
		if (err) throw err;
	});
});
server.listen(port);

let requestOptions = {
	hostname: 'localhost',
	port,
	path: '/',
	method: 'GET',
	headers: {}
};
http.get(requestOptions, (res) => {
	assert.equal(res.headers.sig, type.getSignature());
	io.readTypeAndValue(res.pipe(zlib.createGunzip()), (err, type, value) => {
		if (err) throw err;
		assert.equal(type, new t.DateType);
		assert.equal(value.getTime(), lastValue.getTime());
		requestOptions.headers.sig = res.headers.sig;
		http.get(requestOptions, (res) => {
			io.readValue({type, inStream: res.pipe(zlib.createGunzip())}, (err, value) => {
				if (err) throw err;
				assert.equal(value.getTime(), lastValue.getTime());
				server.close();
			});
		});
	});
});