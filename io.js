const BufferStream = require(__dirname + '/lib/buffer-stream.js');
const GrowableBuffer = require(__dirname + '/lib/growable-buffer.js');

function close() {
  this.end();
}

const io = module.exports = {
  writeType: (type, outStream) => {
    return new BufferStream(type.toBuffer()).pipe(outStream).on('error', close).on('finish', function() {
      this.emit('sb-written');
    });
  },
  writeValue: (type, value, outStream) => {
    const valueBuffer = new GrowableBuffer();
    type.writeValue(valueBuffer, value);
    return new BufferStream(valueBuffer).pipe(outStream).on('error', close).on('finish', function() {
      this.emit('sb-written');
    });
  },
  writeTypeAndValue: (type, value, outStream) => {
    const typeStream = new BufferStream(type.toBuffer());
    typeStream.pipe(outStream, {end: false}).on('error', close);
    typeStream.on('bs-written', () => { //can't listen for finish because it isn't called on a pipe without an end
      io.writeValue(type, value, outStream);
    });
    return outStream;
  }
};