"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_1 = require("./abstract");
/**
 * A type that is not a [[PointerType]].
 * Used internally to disallow creating double pointers.
 * @private
 */
class AbsoluteType extends abstract_1.default {
}
exports.default = AbsoluteType;
