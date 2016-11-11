#!/bin/bash
which jsdoc > /dev/null || npm install -g jsdoc
rm -r docs
jsdoc --verbose -c js-conf.json -d docs \
	README.md \
	structure-types.js \
	read.js \
	recursive-registry.js \
	io.js \
	lib/buffer-stream.js \
	lib/growable-buffer.js \
	index.js \
	client-side/upload.js \
	client-side/download.js