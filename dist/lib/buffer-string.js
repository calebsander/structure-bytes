"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
const growable_buffer_1 = require("./growable-buffer");
//Arbitrarily set; fairly low to be safe
const MAX_ARGUMENTS_LENGTH = 0x1000;
//Convert bytes to a UTF-8 string
function toString(buffer) {
    assert_1.default.instanceOf(buffer, Uint8Array);
    //Taken from https://github.com/feross/buffer/blob/da8a677bdb746ed9d6dae42ee1eaf236aad32ccb/index.js#L917-L988
    const codePoints = [];
    for (let i = 0; i < buffer.length;) {
        const firstByte = buffer[i];
        let codePoint;
        let bytesPerSequence = firstByte > 0xEF ? 4
            : firstByte > 0xDF ? 3
                : firstByte > 0xBF ? 2
                    : 1;
        if (i + bytesPerSequence <= buffer.length) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            //tslint:disable-next-line:switch-default
            switch (bytesPerSequence) {
                case 1:
                    if (firstByte < 0x80)
                        codePoint = firstByte;
                    break;
                case 2:
                    secondByte = buffer[i + 1];
                    if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                        if (tempCodePoint > 0x7F)
                            codePoint = tempCodePoint;
                    }
                    break;
                case 3:
                    secondByte = buffer[i + 1];
                    thirdByte = buffer[i + 2];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF))
                            codePoint = tempCodePoint;
                    }
                    break;
                /*istanbul ignore next*/
                case 4:
                    secondByte = buffer[i + 1];
                    thirdByte = buffer[i + 2];
                    fourthByte = buffer[i + 3];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000)
                            codePoint = tempCodePoint;
                    }
            }
        }
        if (codePoint === undefined) {
            codePoint = 0xFFFD;
            bytesPerSequence = 1;
        }
        else {
            /*istanbul ignore if*/
            if (codePoint > 0xFFFF) {
                codePoint -= 0x10000;
                codePoints.push(codePoint >>> 10 & 0x3FF | 0xD800);
                codePoint = 0xDC00 | codePoint & 0x3FF;
            }
        }
        codePoints.push(codePoint);
        i += bytesPerSequence;
    }
    let str = '';
    for (let i = 0; i < codePoints.length; i += MAX_ARGUMENTS_LENGTH) {
        str += String.fromCharCode(...codePoints.slice(i, i + MAX_ARGUMENTS_LENGTH));
    }
    return str;
}
exports.toString = toString;
//Convert a string to UTF-8 bytes
function fromString(str) {
    assert_1.default.instanceOf(str, String);
    //Taken from http://stackoverflow.com/a/18729931
    const utf8 = new growable_buffer_1.default;
    for (const char of str) {
        let charcode = char.charCodeAt(0);
        if (charcode < 0x80)
            utf8.add(charcode);
        else if (charcode < 0x800) {
            utf8.add(0xc0 | (charcode >> 6));
            utf8.add(0x80 | (charcode & 0x3f));
        }
        else {
            /*istanbul ignore else*/
            if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.add(0xe0 | (charcode >> 12));
                utf8.add(0x80 | ((charcode >> 6) & 0x3f));
                utf8.add(0x80 | (charcode & 0x3f));
            }
            else {
                charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (charcode & 0x3ff));
                utf8.add(0xf0 | (charcode >> 18));
                utf8.add(0x80 | ((charcode >> 12) & 0x3f));
                utf8.add(0x80 | ((charcode >> 6) & 0x3f));
                utf8.add(0x80 | (charcode & 0x3f));
            }
        }
    }
    return utf8.toBuffer();
}
exports.fromString = fromString;
//Convert bytes to a string where each character represents one byte
//Used for representing ArrayBuffers as keys in maps
function toBinaryString(buffer) {
    assert_1.default.instanceOf(buffer, ArrayBuffer);
    let str = '';
    const castBuffer = new Uint8Array(buffer);
    for (let i = 0; i < castBuffer.length; i += MAX_ARGUMENTS_LENGTH) {
        str += String.fromCharCode(...castBuffer.subarray(i, i + MAX_ARGUMENTS_LENGTH));
    }
    return str;
}
exports.toBinaryString = toBinaryString;
//Convert a string generated by toBinaryString() back into bytes
function fromBinaryString(str) {
    assert_1.default.instanceOf(str, String);
    const buffer = new ArrayBuffer(str.length);
    const castBuffer = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++)
        castBuffer[i] = str[i].charCodeAt(0);
    return buffer;
}
exports.fromBinaryString = fromBinaryString;
