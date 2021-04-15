"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPEATED_TYPE = void 0;
/**
 * Type byte indicating what follows is a `flexInt` containing the location of the type.
 * The number is a negative offset from this type byte to the true location.
 */
exports.REPEATED_TYPE = 0xFF;
