const assert = require(__dirname + '/assert.js');
const stream = require('stream');

module.exports = class extends stream.Transform {
	constructor(match, result) {
		super();
		assert.instanceOf(match, String);
		assert.instanceOf(result, String);
		this.match = match;
		this.result = result;
		this.matching = 0;
	}
	_transform(chunk, encoding, callback) {
		if (chunk.constructor === Buffer) chunk = chunk.toString();
		for (let i = 0; i < chunk.length; i++) {
			let char = chunk[i];
			if (char === this.match[this.matching]) {
				this.matching++;
				if (this.matching === this.match.length) {
					this.push(this.result);
					this.matching = 0;
				}
			}
			else {
				this.push(chunk.substring(i - this.matching, i));
				if (char === this.match[0]) this.matching = 1;
				else {
					this.push(char);
					this.matching = 0;
				}
			}
		}
		if (this.matching) this.lastChunk = chunk;
		if (callback !== undefined) callback();
	}
	_flush(callback) {
		if (this.matching) this.push(this.lastChunk.substring(this.lastChunk.length - this.matching));
		if (callback !== undefined) callback();
	}
};