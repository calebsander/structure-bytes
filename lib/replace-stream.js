const assert = require(__dirname + '/assert.js')
const stream = require('stream')

//Transforms an input into an output by doing simple replacements
//Assumes input is in ASCII-7 (so that code points don't get cut by chunk boundaries)
module.exports = class extends stream.Transform {
	constructor(match, result) {
		super()
		assert.instanceOf(match, String)
		assert.instanceOf(result, String)
		this.match = match
		this.result = result
		this.matching = 0
	}
	_transform(chunk, encoding, callback) {
		if (chunk.constructor === Buffer) chunk = chunk.toString()
		for (let i = 0; i < chunk.length; i++) {
			const char = chunk[i]
			if (char === this.match[this.matching]) {
				this.matching++ //keep track of the number of characters matched
				if (this.matching === this.match.length) { //if whole string is matched, push out the result
					this.push(this.result)
					this.matching = 0 //reset number of characters matched
				}
			}
			else { //character doesn't match, so push all stored characters
				this.push(chunk.substring(i - this.matching, i))
				//Reset match index to start of string
				if (char === this.match[0]) this.matching = 1
				else {
					this.push(char)
					this.matching = 0
				}
			}
		}
		if (this.matching) this.lastChunk = chunk
		if (callback !== undefined) callback()
	}
	_flush(callback) {
		//Deal with any residual matching characters
		if (this.matching) this.push(this.lastChunk.substring(this.lastChunk.length - this.matching))
		if (callback !== undefined) callback()
	}
}