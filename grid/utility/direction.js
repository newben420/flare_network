"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compute2ExpDirection = exports.compute1ExpDirection = exports.computeArithmeticDirection = void 0;
const computeArithmeticDirection = (arr, points = 2) => {
    if (points < 2) {
        points = 2;
    }
    if (arr.length < points) {
        return 0;
    }
    arr = arr.slice(arr.length - points);
    let direction = 0;
    for (let i = 1; i < points; i++) {
        if ((arr[i] || arr[i] === 0) && (arr[i - 1] || arr[i - 1] === 0)) {
            if (arr[i] > arr[i - 1]) {
                direction++;
            }
            if (arr[i] < arr[i - 1]) {
                direction--;
            }
        }
    }
    return (direction >= 1) ? 1 : ((direction <= -1) ? -1 : 0);
};
exports.computeArithmeticDirection = computeArithmeticDirection;
const compute1ExpDirection = (arr, points = 2) => {
    if (points < 2) {
        points = 2;
    }
    if (arr.length < points) {
        return 0;
    }
    arr = arr.slice(arr.length - points);
    let direction = 0;
    for (let i = 1; i < points; i++) {
        if ((arr[i] || arr[i] === 0) && (arr[i - 1] || arr[i - 1] === 0)) {
            if (arr[i] > arr[i - 1]) {
                direction += (i);
            }
            if (arr[i] < arr[i - 1]) {
                direction -= (i);
            }
        }
    }
    return (direction >= 1) ? 1 : ((direction <= -1) ? -1 : 0);
};
exports.compute1ExpDirection = compute1ExpDirection;
const compute2ExpDirection = (arr, points = 2) => {
    if (points < 2) {
        points = 2;
    }
    if (arr.length < points) {
        return 0;
    }
    arr = arr.slice(arr.length - points);
    let direction = 0;
    for (let i = 1; i < points; i++) {
        if ((arr[i] || arr[i] === 0) && (arr[i - 1] || arr[i - 1] === 0)) {
            if (arr[i] > arr[i - 1]) {
                direction += (i * 2);
            }
            if (arr[i] < arr[i - 1]) {
                direction -= (i * 2);
            }
        }
    }
    return (direction >= 1) ? 1 : ((direction <= -1) ? -1 : 0);
};
exports.compute2ExpDirection = compute2ExpDirection;
