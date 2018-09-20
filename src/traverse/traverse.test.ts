import { mapValues } from 'lodash';
import { primitive, object, array } from './traverse';

const wrap = (x: any) => `wrap(${x})`;
const wrapObject = (x: object) => mapValues(x, wrap);

describe.skip('Primitive', () => {
    describe('Empty itr -> identity', () => {
        const traverse = primitive();
        it('undefined', () => {
            expect.assertions(1);
            return expect(traverse()).resolves.toBe(undefined);
        });
        it('number', () => {
            expect.assertions(1);
            return expect(traverse(1)).resolves.toBe(1);
        });
        it('plain object', () => {
            expect.assertions(1);
            const obj = { a: 1 };
            return expect(traverse(obj)).resolves.toBe(obj);
        });
    });
    describe('Remap', () => {
        const traverse = primitive(wrap);
        it('undefined', () => {
            expect.assertions(1);
            return expect(traverse()).resolves.toBe(wrap(undefined));
        });
        it('number', () => {
            expect.assertions(1);
            return expect(traverse(1)).resolves.toBe(wrap(1));
        });
        it('plain object', () => {
            const traverse = primitive(wrapObject);
            expect.assertions(1);
            const obj = { a: 1 };
            return expect(traverse(obj)).resolves.toEqual(wrapObject(obj));
        });
    });
});

describe.skip('Object', () => {
    describe('All empty', () => {
        const traverse = object();
        [
            {},
            1,
            'Asd',
            null,
            undefined,
        ]
            .forEach(item => {
                it(`${JSON.stringify(item)} -> {}`, () => {
                    expect.assertions(1);
                    return expect(traverse(item)).resolves.toEqual({});
                });
            });
    });
    describe('Remap - follow ObjectSchema', () => {
        const traverse = object({ a: primitive(wrap) });
        [
            {},
            1,
            'Asd',
            null,
            undefined,
        ]
            .forEach(item => {
                it(`${JSON.stringify(item)} -> { a: Remapped }`, () => {
                    expect.assertions(1);
                    return expect(traverse(item)).resolves.toEqual({ a: wrap(undefined) });
                });
            });
    });
});

describe.skip('Array', () => {
    describe('All empty', () => {
        const traverse = array();
        [
            {},
            1,
            'Asd',
            null,
            undefined,
        ]
            .forEach(item => {
                it(`${JSON.stringify(item)} -> []`, () => {
                    expect.assertions(1);
                    return expect(traverse(item)).resolves.toEqual([]);
                });
            });
    });
    describe('Remap - follow ItemSchema', () => {
        const traverse = array(primitive(wrap));
        [
            {},
            1,
            'Asd',
            null,
            undefined,
        ]
            .forEach(item => {
                it(`${JSON.stringify(item)} -> []`, () => {
                    expect.assertions(1);
                    return expect(traverse(item)).resolves.toEqual([]);
                });
            });
        [
            [1],
            ['1', 1, undefined],
        ]
            .forEach(item => {
                it(`${JSON.stringify(item)} -> Remap[]`, () => {
                    expect.assertions(1);
                    return expect(traverse(item)).resolves.toEqual(item.map(wrap));
                });
            });
    });
});
