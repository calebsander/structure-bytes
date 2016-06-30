const BufferStream = require(__dirname + '/lib/buffer-stream.js');
const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js');

module.exports = {
  writeTypeAndValue: (type, value, outStream) => {
    new BufferStream(type.toBuffer()).pipe(outStream, {end: false});
    let valueBuffer = new GrowableBuffer();
    type.writeValue(valueBuffer, value);
    return new BufferStream(valueBuffer).pipe(outStream);
  }
};