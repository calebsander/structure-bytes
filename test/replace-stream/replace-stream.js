let s = new Simultaneity();
s.addTask(() => {
	let stream = new BufferStream(Buffer.from('aéééébcéééféghé'));
	let output = stream.pipe(new ReplaceStream('éé', 'ee'));
	let buffers = [];
	output.on('data', (chunk) => buffers.push(chunk)).on('end', () => {
		let text = Buffer.concat(buffers).toString();
		assert.equal(text, 'aeeeebceeéféghé');
		s.taskFinished();
	});
});
let wait = setInterval(() => {}, 10);
s.callback(() => clearInterval(wait));