"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var traverse_1 = require("./traverse");
var wrap = function (x) { return "wrap(" + x + ")"; };
describe('Primitive', function () {
    var emptyResult = traverse_1.primitive()();
    it('', function () {
        expect.assertions(1);
        expect(emptyResult).resolves.toBe(undefined);
    });
});
