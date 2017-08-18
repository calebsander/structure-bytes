import * as http from 'http'
import * as zlib from 'zlib'
import assert from '../../dist/lib/assert'
import * as io from '../../dist'
import * as t from '../../dist'

const port = 8080
const type = new t.DateType

const responseValue = new Date
const server = http.createServer((req, res) => {
	const throwError = req.url === '/error'
	if (throwError) res.end()
	if (req.url === '/no-callback') io.httpRespond({req, res, type, value: responseValue})
	else {
		io.httpRespond({req, res, type, value: responseValue}, err => {
			if (throwError) assert.errorMessage(err, "Can't set headers after they are sent.")
			else {
				if (err) throw err
			}
		})
	}
})
server.listen(port)

const requestOptions = {
	hostname: '127.0.0.1',
	port,
	path: '/',
	method: 'GET'
}
const requestDate = new Promise((resolve, reject) => {
	http.get(requestOptions, res => {
		try {
			assert.equal(res.headers.sig, type.getSignature())
			io.readTypeAndValue(res, (err, type, value) => {
				try {
					if (err) throw err
					assert.equal(type, new t.DateType)
					assert.equal(value.getTime(), responseValue.getTime())
					resolve()
				}
				catch (e) { reject(e) }
			})
		}
		catch (e) { reject(e) }
	})
})
const requestGzip = new Promise((resolve, reject) => {
	http.get({...requestOptions, headers: {'Accept-Encoding': '*'}}, res => {
		try {
			assert.equal(res.headers.sig, type.getSignature())
			io.readTypeAndValue(res.pipe(zlib.createGunzip()), (err, type, value) => {
				try {
					if (err) throw err
					assert.equal(type, new t.DateType)
					assert.equal(value.getTime(), responseValue.getTime())
					resolve()
				}
				catch (e) { reject(e) }
			})
		}
		catch (e) { reject(e) }
	})
})
const requestWithSignature = new Promise((resolve, reject) => {
	http.get({...requestOptions, headers: {'Accept-Encoding': 'gzip;q=0.00', sig: type.getSignature()}}, res => {
		try {
			io.readValue({type, inStream: res}, (err, value) => {
				try {
					if (err) throw err
					if (value === null) throw new Error('Missing value')
					assert.equal(value.getTime(), responseValue.getTime())
					resolve()
				}
				catch (e) { reject(e) }
			})
		}
		catch (e) { reject(e) }
	})
})
const requestGzipWithSignature = new Promise((resolve, reject) => {
	http.get({...requestOptions, headers: {'Accept-Encoding': 'compress, gzip', sig: type.getSignature()}}, res => {
		try {
			io.readValue({type, inStream: res.pipe(zlib.createGunzip())}, (err, value) => {
				try {
					if (err) throw err
					if (value === null) throw new Error('Missing value')
					assert.equal(value.getTime(), responseValue.getTime())
					resolve()
				}
				catch (e) { reject(e) }
			})
		}
		catch (e) { reject(e) }
	})
})
const errorRequest = new Promise((resolve, reject) => {
	http.get({...requestOptions, path: '/error'}, res => {
		const chunks: Buffer[] = []
		res
			.on('data', chunk => chunks.push(chunk as Buffer))
			.on('end', () => {
				try {
					assert.equal(Buffer.concat(chunks), Buffer.from([]))
					resolve()
				}
				catch (e) { reject(e) }
			})
			.on('error', reject)
	})
})
const noCallbackRequest = new Promise((resolve, reject) => {
	http.get({...requestOptions, path: '/no-callback'}, res => {
		try {
			assert.equal(res.headers.sig, type.getSignature())
			io.readTypeAndValue(res, (err, type, value) => {
				try {
					if (err) throw err
					assert.equal(type, new t.DateType)
					assert.equal(value.getTime(), responseValue.getTime())
					resolve()
				}
				catch (e) { reject(e) }
			})
		}
		catch (e) { reject(e) }
	})
})

const port2 = port + 1
const server2 = http.createServer((req, res) => {
	io.httpRespond({req, res, type: new t.ByteType, value: '257'}, err => {
		assert.errorMessage(err, 'Value out of range (257 is not in [-128,128))')
		res.end()
	})
})
server2.listen(port2)
const writeErrorRequest = new Promise((resolve, reject) => {
	http.get({...requestOptions, port: port2}, res => {
		try {
			server2.close()
			resolve()
		}
		catch (e) { reject(e) }
	})
})

export = Promise.all([
	requestDate,
	requestGzip,
	requestWithSignature,
	requestGzipWithSignature,
	errorRequest,
	noCallbackRequest,
	writeErrorRequest
])
	.then(() => server.close())
	.catch(() => server.close())