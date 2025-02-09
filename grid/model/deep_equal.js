"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepEqual = deepEqual;
function deepEqual(obj1, obj2) {
    if (obj1 === obj2) {
        return true; // Handle same reference or primitive values
    }
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return false; // Handle non-object or null values
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    return keys1.every(key => {
        const keyTyped = key;
        return deepEqual(obj1[keyTyped], obj2[keyTyped]);
    });
}
