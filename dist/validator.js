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
var mongooseValidator = require("mongoose-validator");
var constant = function (x) { return function () { return x; }; };
var identity = function (x) { return x; };
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
var defaultIsValueEmpty = function (value) { return (value === null
    || value === undefined
    || (typeof value === 'object' && isEmpty(value))); };
var messages = {
    'invalidType.string': 'Value is not a string',
    'invalidType.number': 'Value is not a number',
    'invalidType.boolean': 'Value is not a boolean',
    'invalidType.object': 'Value is not a object',
    noneOf: 'Value is none of {ARGS[0]}',
    isRequired: 'Value is required',
};
exports.messages = messages;
var validResult = true;
var invalidResult = !validResult;
var isValid = function (invokedValidatable) { return invokedValidatable.result === validResult; };
var isInvalid = negate(isValid);
var T_SHAPE = Symbol('shape');
var defaultValidtorOptions = {
    noMongoose: false,
    validator: constant(validResult),
    message: 'Error',
};
var withDefaultValidatorOptions = function (validatorOptions) { return (__assign({}, defaultValidtorOptions, validatorOptions)); };
var cast = function (validatable, type, defaultVal) {
    if (defaultVal === void 0) { defaultVal = ''; }
    return function (value) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        return validatable.apply(void 0, [type(value || defaultVal)].concat(rest));
    };
};
exports.cast = cast;
var createAssertion = function (iniValidatorOptions) {
    var fullValidatorOpts = withDefaultValidatorOptions(iniValidatorOptions);
    var validatorOptions = (fullValidatorOpts.noMongoose ? identity : mongooseValidator)(fullValidatorOpts);
    // Cast validator.js validators inputs to string to prevent the error thrown
    if (iniValidatorOptions && (typeof iniValidatorOptions.validator === 'string')) {
        validatorOptions.validator = cast(validatorOptions.validator, String);
    }
    var assertion = function (value) {
        return whenDone_1.default(function (validatorResult) {
            var invokedValidatable = {
                result: validatorResult,
                message: validatorOptions.message,
            };
            return invokedValidatable;
        }, validatorOptions.validator(value));
    };
    assertion.isRequired = function (isValueEmpty) {
        return function (value) {
            var requiredResult = isRequired(isValueEmpty)(value);
            if (!requiredResult.result) {
                return {
                    result: requiredResult.result,
                    message: requiredResult.message,
                };
            }
            return assertion(value);
        };
    };
    return assertion;
};
exports.createAssertion = createAssertion;
var combineMessages = function (messages) { return [].concat.apply([], messages); };
var oneOf = function (alts) {
    return createAssertion({
        message: messages.noneOf,
        arguments: [alts.map(String).join(', ')],
        validator: function (value) { return alts.includes(value); },
    });
};
exports.oneOf = oneOf;
var isType = function (type) {
    // Validators have to bypass the mongoose validators,
    // otherwise validator funcs wont be called on e.g. undefined values
    return createAssertion({
        message: messages["invalidType." + type],
        validator: function (x) { return (typeof x === type); },
        noMongoose: true,
    });
};
exports.isType = isType;
var isRequired = function (isValueEmpty) {
    if (isValueEmpty === void 0) { isValueEmpty = defaultIsValueEmpty; }
    return function (value) {
        return {
            result: !isValueEmpty(value),
            message: messages.isRequired,
        };
    };
};
exports.isRequired = isRequired;
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
    var validateMembers = traverse_1.array(itemStructure, function (arrayResult) { return ({
        result: !arrayResult.some(isInvalid),
        message: arrayResult.some(isInvalid)
            ? arrayResult
                .map(function (invokedValidatable) {
                return invokedValidatable.result
                    // Array of objects vs array of anything else:
                    // Object empty={}, otherwise=[]
                    ? (itemStructure[T_SHAPE] ? {} : combineMessages())
                    : (itemStructure[T_SHAPE]
                        ? invokedValidatable.message
                        : combineMessages([invokedValidatable.message]));
            })
            : []
    }); });
    validateMembers.isRequired = function (isValueEmpty) {
        return function (value) {
            var requiredResult = isRequired(isValueEmpty)(value);
            if (!requiredResult.result) {
                return {
                    result: requiredResult.result,
                    message: [
                        combineMessages([requiredResult.message]),
                    ],
                };
            }
            return validateMembers(value);
        };
    };
    return validateMembers;
};
exports.arrayOf = arrayOf;
