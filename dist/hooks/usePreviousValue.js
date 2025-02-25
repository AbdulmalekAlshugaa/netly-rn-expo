"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
/**
 * Stores the last known value during every render.
 *
 * @param value Primitive variable to be stored as the "previous value" upon the next render.
 * @returns The last known value.
 */
var usePreviousValue = function (value) {
    var ref = (0, react_1.useRef)(undefined);
    (0, react_1.useEffect)(function () {
        ref.current = value;
    });
    return ref.current;
};
exports.default = usePreviousValue;
