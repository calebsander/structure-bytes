#!/bin/sh
which jsdoc > /dev/null
[ "$?" != "0" ] && npm install -g jsdoc
jsdoc --verbose -c js-conf.json \
README.md \
structure-types.js \
lib/growable-buffer.js
rm -r doc
mv out doc