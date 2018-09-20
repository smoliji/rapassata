"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SchemaType_1 = require("./SchemaType");
var createSchema = function (type, data) {
    switch (type) {
        case SchemaType_1.default.array:
            return { type: type, itemSchema: data };
        case SchemaType_1.default.object:
            return { type: type, objectSchema: data };
        case SchemaType_1.default.primitive:
            return { type: type };
        default:
            throw new Error('Unsupported Schema type');
    }
};
exports.default = createSchema;
