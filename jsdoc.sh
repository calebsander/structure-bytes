#!/bin/sh
jsdoc --verbose -c js-conf.json \
README.md \
structure-types.js
rm -r doc
mv out doc