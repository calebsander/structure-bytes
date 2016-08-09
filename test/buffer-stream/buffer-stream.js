/*eslint-disable no-undef*/
let inBuffer = new ArrayBuffer(0);
let bs = new BufferStream(inBuffer);
let outBuffer = new GrowableBuffer;
let s = new Simultaneity;
s.addTask(() => {
	bs.on('data', chunk => outBuffer.addAll(chunk)).on('end', () => {
		assert.equal(outBuffer.toBuffer(), inBuffer);
		s.taskFinished();
	});
});
let inBuffer2 = Buffer.allocUnsafe(100000).buffer;
let bs2 = new BufferStream(inBuffer2);
let outBuffer2 = new GrowableBuffer;
s.addTask(() => {
	bs2.on('data', chunk => outBuffer2.addAll(chunk)).on('end', () => {
		assert.equal(outBuffer2.toBuffer(), inBuffer2);
		s.taskFinished();
	});
});
let wait = setInterval(() => {}, 10);
s.callback(() => clearInterval(wait));