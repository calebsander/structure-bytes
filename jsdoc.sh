#!/bin/bash
which jsdoc > /dev/null || npm install -g jsdoc
jsdoc --verbose -c js-conf.json \
README.md \
structure-types.js \
read.js \
io.js \
lib/buffer-stream.js \
lib/growable-buffer.js \
index.js \
client-side/upload.js \
client-side/download.js
rm -r doc
mv out doc