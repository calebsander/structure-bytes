/*eslint-disable no-undef*/
let s = new Simultaneity;
let inBuffer = new ArrayBuffer(0);
let bs = new BufferStream(inBuffer);
let outChunks = [];
s.addTask(() => {
	bs.on('data', chunk => outChunks.push(chunk)).on('end', () => {
		assert.equal(Buffer.concat(outChunks), Buffer.from(inBuffer));
		s.taskFinished();
	});
});
let inBuffer2 = Buffer.allocUnsafe(100000).buffer;
let bs2 = new BufferStream(inBuffer2);
let outChunks2 = [];
s.addTask(() => {
	bs2.on('data', chunk => outChunks2.push(chunk)).on('end', () => {
		assert.equal(Buffer.concat(outChunks2), Buffer.from(inBuffer2));
		s.taskFinished();
	});
});
let wait = setInterval(() => {}, 10);
s.callback(() => clearInterval(wait));