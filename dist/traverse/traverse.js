"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var Bluebird = require("bluebird");
exports.primitive = function (iteratee) {
    if (iteratee === void 0) { iteratee = lodash_1.identity; }
    return function (subject) { return Bluebird.resolve(iteratee(subject)); };
};
exports.object = function (schema, iteratee) {
    if (iteratee === void 0) { iteratee = lodash_1.identity; }
    return function (subject) {
        return Bluebird.props(lodash_1.mapValues(schema, function (traverse, key) { return traverse((subject || {})[key]); }))
            .then(iteratee);
    };
};
exports.array = function (itemSchema, iteratee) {
    if (iteratee === void 0) { iteratee = lodash_1.identity; }
    return function (subject) {
        if (lodash_1.isNil(subject)) {
            return Promise.resolve([]);
        }
        if (!Array.isArray(subject)) {
            throw new TypeError('Subject must be an array');
        }
        return Bluebird.all(subject.map(itemSchema))
            .then(iteratee);
    };
};
exports.object({ a: exports.array(exports.array(exports.primitive(function (x) { return Promise.resolve(x + 1); }))) })({ a: [[1, 2], [1]] })
    .then(console.log);
