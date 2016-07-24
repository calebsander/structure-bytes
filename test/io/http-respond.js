/*eslint-disable no-undef*/
const http = require('http');
const zlib = require('zlib');

const port = 8080;
let type = new t.DateType;

let responseValue = new Date;
let server = http.createServer((req, res) => {
	let throwError = req.url === '/error';
	if (throwError) res.end();
	io.httpRespond({req, res, type, value: responseValue}, (err) => {
		if (throwError) assert.message(err, "Can't set headers after they are sent.");
		else {
			if (err) throw err;
		}
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
let s = new Simultaneity;
s.addTask(() => {
	http.get(requestOptions, (res) => {
		assert.equal(res.headers.sig, type.getSignature());
		io.readTypeAndValue(res.pipe(zlib.createGunzip()), (err, type, value) => {
			if (err) throw err;
			assert.equal(type, new t.DateType);
			assert.equal(value.getTime(), responseValue.getTime());
			s.taskFinished();
		});
	});
});
s.addTask(() => {
	requestOptions.headers.sig = type.getSignature();
	http.get(requestOptions, (res) => {
		io.readValue({type, inStream: res.pipe(zlib.createGunzip())}, (err, value) => {
			if (err) throw err;
			assert.equal(value.getTime(), responseValue.getTime());
			s.taskFinished();
		});
	});
});
s.addTask(() => {
	requestOptions.path = '/error';
	http.get(requestOptions, (res) => {
		let chunks = [];
		res.on('data', (chunk) => chunks.push(chunk));
		res.on('end', () => {
			assert.equal(Buffer.concat(chunks), Buffer.from([]));
			s.taskFinished();
		});
	});
});
s.callback(() => server.close());