"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bufferString = require("./buffer-string");
//Map of write buffers to maps of binary strings to sets of indices where pointers to the binary data must be written
const pointers = new WeakMap();
function addInstance({ buffer, value }) {
    let bufferPointers = pointers.get(buffer);
    if (!bufferPointers) {
        bufferPointers = new Map; //initialize pointers map if it doesn't exist
        pointers.set(buffer, bufferPointers);
    }
    const valueString = bufferString.toBinaryString(value); //have to convert the buffer to a string because equivalent buffers are not ===
    const currentIndex = buffer.length;
    const pointerLocations = bufferPointers.get(valueString);
    if (pointerLocations)
        pointerLocations.add(currentIndex);
    else
        bufferPointers.set(valueString, new Set([currentIndex]));
}
exports.addInstance = addInstance;
//After writing all the values, it is necessary to insert all the values of pointer types
//This function should be called in writeValue() for every type that could have a subtype that is a pointer type
function setPointers({ buffer, root }) {
    if (root) {
        const bufferPointers = pointers.get(buffer);
        if (bufferPointers) {
            for (const [binaryString, insertionIndices] of bufferPointers) {
                const index = buffer.length; //value is going to be appended to buffer, so it will start at buffer.length
                buffer.addAll(bufferString.fromBinaryString(binaryString)); //add raw data
                const indexBuffer = new ArrayBuffer(4);
                new DataView(indexBuffer).setUint32(0, index);
                //In each pointer location, set the bytes to be a pointer to the correct location
                for (const insertionIndex of insertionIndices)
                    buffer.setAll(insertionIndex, indexBuffer);
            }
        }
    }
}
exports.setPointers = setPointers;
