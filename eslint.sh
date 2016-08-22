#!/bin/bash
which eslint > /dev/null || npm install -g eslint
eslint --quiet $(find . -name "*.js")