"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SchemaType;
(function (SchemaType) {
    SchemaType[SchemaType["primitive"] = 0] = "primitive";
    SchemaType[SchemaType["object"] = 1] = "object";
    SchemaType[SchemaType["array"] = 2] = "array";
})(SchemaType || (SchemaType = {}));
exports.default = SchemaType;
