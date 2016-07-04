let inBuffer = Buffer.allocUnsafe(0);
let bs = new BufferStream(inBuffer);
let outBuffer = new GrowableBuffer();
let ended = false;
bs.on('data', (chunk) => outBuffer.addAll(chunk)).on('end', () => {
	ended = true;
	assert.equal(outBuffer.toBuffer(), inBuffer);
});
let waitForFinish = setInterval(() => {
	if (ended) clearInterval(waitForFinish);
}, 10);

let inBuffer2 = Buffer.allocUnsafe(100000);
let bs2 = new BufferStream(inBuffer2);
let outBuffer2 = new GrowableBuffer();
let ended2 = false;
bs2.on('data', (chunk) => outBuffer2.addAll(chunk)).on('end', () => {
	ended2 = true;
	assert.equal(outBuffer2.toBuffer(), inBuffer2);
});
let waitForFinish2 = setInterval(() => {
	if (ended) clearInterval(waitForFinish2);
}, 10);