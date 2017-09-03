"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);
function rightRotate(value, bits) {
    return (value >>> bits) | (value << (32 - bits));
}
function pos(value) {
    return new Uint32Array([value])[0];
}
exports.default = (input) => {
    const lBytes = input.byteLength;
    const l = lBytes * 8; //not using bitwise math in case this overflows a 32-bit integer
    assert_1.default(l === pos(l | 0), 'Bit length does not fit in a 32-bit integer');
    const extraBytes = 64 - ((lBytes + 72) & 63);
    const messageLength = lBytes + extraBytes + 8;
    const message = new ArrayBuffer(messageLength);
    const castMessage = new Uint8Array(message);
    castMessage.set(new Uint8Array(input));
    castMessage[lBytes] = 128;
    new DataView(message).setUint32(messageLength - 4, l);
    const h = new Uint32Array([
        0x6a09e667,
        0xbb67ae85,
        0x3c6ef372,
        0xa54ff53a,
        0x510e527f,
        0x9b05688c,
        0x1f83d9ab,
        0x5be0cd19
    ]);
    for (let chunkStart = 0; chunkStart < messageLength; chunkStart += 64) {
        const w = new Uint32Array(64);
        const chunkDataView = new DataView(message, chunkStart, 64);
        for (let i = 0; i < 16; i++)
            w[i] = chunkDataView.getUint32(i << 2);
        for (let i = 16; i < 64; i++) {
            const wMinus15 = w[i - 15];
            const s0 = rightRotate(wMinus15, 7) ^ rightRotate(wMinus15, 18) ^ (wMinus15 >>> 3);
            const wMinus2 = w[i - 2];
            const s1 = rightRotate(wMinus2, 17) ^ rightRotate(wMinus2, 19) ^ (wMinus2 >>> 10);
            w[i] = w[i - 16] + s0 + w[i - 7] + s1;
        }
        const hIncrement = h.slice();
        for (let i = 0; i < 64; i++) {
            /*tslint:disable:indent*/
            const a = hIncrement[0], b = hIncrement[1], c = hIncrement[2], e = hIncrement[4], f = hIncrement[5], g = hIncrement[6];
            /*tslint:enable:indent*/
            const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = hIncrement[7] + S1 + ch + K[i] + w[i];
            const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = S0 + maj;
            hIncrement[7] = g;
            hIncrement[6] = f;
            hIncrement[5] = e;
            hIncrement[4] = hIncrement[3] + temp1;
            hIncrement[3] = c;
            hIncrement[2] = b;
            hIncrement[1] = a;
            hIncrement[0] = temp1 + temp2;
        }
        for (let i = 0; i < 8; i++)
            h[i] += hIncrement[i];
    }
    const result = new ArrayBuffer(32);
    const resultDataView = new DataView(result);
    for (let i = 0; i < 8; i++)
        resultDataView.setUint32(i << 2, h[i]);
    return result;
};
