"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (str) => {
    if (str) {
        if (str.constructor === String) {
            const converted = Number(str);
            if (!isNaN(converted))
                return converted;
        }
    }
    return; //returned if conversion failed
};
