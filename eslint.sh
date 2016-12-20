#!/bin/bash
which eslint > /dev/null || npm install -g eslint
eslint --quiet $(find . -name "*.js" | grep -v "node_modules") #Removing node_modules files because Windows throws an error if argument list is too long