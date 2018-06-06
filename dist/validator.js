"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var traverse_1 = require("schematic-traverse-node/dist/traverse");
var whenDone_1 = require("schematic-traverse-node/dist/whenDone");
var constant = function (x) { return function () { return x; }; };
var negate = function (fn) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return !fn.apply(void 0, args);
}; };
var toPairs = function (obj) {
    if (obj === void 0) { obj = {}; }
    return Object.keys(obj)
        .map(function (key) { return [key, obj[key]]; });
};
var fromPairs = function (pairs) { return pairs.reduce(function (obj, _a) {
    var key = _a[0], value = _a[1];
    obj[key] = value;
    return obj;
}, {}); };
var isEmpty = function (obj) {
    if (obj === void 0) { obj = {}; }
    return !Object.keys(obj).length;
};
var messages = {
    invalidTypeString: 'Value is not a string',
    invalidTypeNumber: 'Value is not a number',
};
exports.messages = messages;
var validResult = true;
var invalidResult = !validResult;
var isValid = function (invokedValidatable) { return invokedValidatable.result === validResult; };
var isInvalid = negate(isValid);
var T_SHAPE = Symbol('shape');
var defaultValidtorOptions = {
    validator: constant(validResult),
    message: 'Error',
};
var withDefaultValidatorOptions = function (validatorOptions) { return (__assign({}, defaultValidtorOptions, validatorOptions)); };
var createValidatable = function (validatorOptions) {
    validatorOptions = withDefaultValidatorOptions(validatorOptions);
    return function (value) {
        return whenDone_1.default(function (validatorResult) {
            var invokedValidatable = {
                result: validatorResult,
                message: validatorOptions.message,
            };
            return invokedValidatable;
        }, validatorOptions.validator(value));
    };
};
var combineMessages = function (messages) { return [].concat.apply([], messages); };
var isType = function (type) {
    if (type === 'number') {
        return createValidatable({
            message: messages.invalidTypeNumber,
            validator: function (x) { return (typeof x === type); },
        });
    }
    if (type === 'string') {
        return createValidatable({
            message: messages.invalidTypeString,
            validator: function (x) { return (typeof x === type); },
        });
    }
    throw new TypeError("`" + type + "` is not a valid type check.");
};
exports.isType = isType;
var and = function (validatables) {
    return function (value) {
        return whenDone_1.default(function (invokedValidatables) { return ({
            result: invokedValidatables.every(isValid),
            message: combineMessages(invokedValidatables
                .filter(isInvalid)
                .map(function (invokedValidatable) { return invokedValidatable.message; })),
        }); }, validatables.map(function (validatable) { return validatable(value); }));
    };
};
exports.and = and;
var or = function (validatables) {
    return function (value) {
        return whenDone_1.default(function (invokedValidatables) { return ({
            result: invokedValidatables.some(isValid),
            message: combineMessages(invokedValidatables
                .filter(isInvalid)
                .map(function (invokedValidatable) { return invokedValidatable.message; })),
        }); }, validatables.map(function (validatable) { return validatable(value); }));
    };
};
exports.or = or;
var shapeOf = function (structure) {
    var exec = traverse_1.shape(structure, function (shapeResult) { return ({
        result: isEmpty(structure) || !toPairs(shapeResult)
            .some(function (_a) {
            var invokedValidatable = _a[1];
            return isInvalid(invokedValidatable);
        }),
        message: fromPairs(toPairs(shapeResult)
            .filter(function (_a) {
            var invokedValidatable = _a[1];
            return isInvalid(invokedValidatable);
        })
            .map(function (_a) {
            var key = _a[0], invokedValidatable = _a[1];
            return [
                key,
                (typeof invokedValidatable.message === 'object'
                    && !Array.isArray(invokedValidatable.message))
                    ? invokedValidatable.message
                    : combineMessages([invokedValidatable.message])
            ];
        })),
    }); });
    // To distinct primitives and shapes
    exec[T_SHAPE] = true;
    return exec;
};
exports.shapeOf = shapeOf;
var arrayOf = function (itemStructure) {
    return traverse_1.array(itemStructure, function (arrayResult) { return ({
        result: !arrayResult.some(isInvalid),
        message: arrayResult.some(isInvalid)
            ? arrayResult
                .map(function (invokedValidatable) {
                return invokedValidatable.result
                    ? (itemStructure[T_SHAPE] ? {} : combineMessages())
                    : (itemStructure[T_SHAPE]
                        ? invokedValidatable.message
                        : combineMessages([invokedValidatable.message]));
            })
            : []
    }); });
};
exports.arrayOf = arrayOf;
// console.log(
// isType('string')('1'),
// and([isType('string'), isType('number')])('A')
// shapeOf(
//     {
//         // a: isType('string')
//         a: shapeOf(
//             {
//                 b: isType('number')
//             }
//         )
//     }
// )(
//     {
//         a: null
//     }
// )
// arrayOf(isType('string'))([1, '2'])
// )
