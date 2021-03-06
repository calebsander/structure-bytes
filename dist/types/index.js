"use strict";
/*istanbul ignore next*/ //for TypeScript's auto-generated code
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointerType = exports.RecursiveType = void 0;
__exportStar(require("./type"), exports);
__exportStar(require("./byte"), exports);
__exportStar(require("./short"), exports);
__exportStar(require("./int"), exports);
__exportStar(require("./long"), exports);
__exportStar(require("./big-int"), exports);
__exportStar(require("./flex-int"), exports);
__exportStar(require("./unsigned-byte"), exports);
__exportStar(require("./unsigned-short"), exports);
__exportStar(require("./unsigned-int"), exports);
__exportStar(require("./unsigned-long"), exports);
__exportStar(require("./big-unsigned-int"), exports);
__exportStar(require("./flex-unsigned-int"), exports);
__exportStar(require("./date"), exports);
__exportStar(require("./day"), exports);
__exportStar(require("./time"), exports);
__exportStar(require("./float"), exports);
__exportStar(require("./double"), exports);
__exportStar(require("./boolean"), exports);
__exportStar(require("./boolean-tuple"), exports);
__exportStar(require("./boolean-array"), exports);
__exportStar(require("./char"), exports);
__exportStar(require("./string"), exports);
__exportStar(require("./octets"), exports);
__exportStar(require("./tuple"), exports);
__exportStar(require("./struct"), exports);
__exportStar(require("./array"), exports);
__exportStar(require("./set"), exports);
__exportStar(require("./map"), exports);
__exportStar(require("./enum"), exports);
__exportStar(require("./choice"), exports);
var recursive_1 = require("./recursive");
Object.defineProperty(exports, "RecursiveType", { enumerable: true, get: function () { return recursive_1.RecursiveType; } });
__exportStar(require("./singleton"), exports);
__exportStar(require("./optional"), exports);
var pointer_1 = require("./pointer");
Object.defineProperty(exports, "PointerType", { enumerable: true, get: function () { return pointer_1.PointerType; } });
