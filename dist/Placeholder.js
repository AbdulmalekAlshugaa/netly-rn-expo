"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var Placeholder = function () {
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.text}>Hello from netly-rn-expo!</react_native_1.Text>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
});
exports.default = Placeholder;
