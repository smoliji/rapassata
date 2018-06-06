const mocha = require('mocha');
const expect = require('chai').expect;
const { isType, messages } = require('../dist/validator');

describe('Primitives', () => {
    [
        // triplets of
        // [ type&message, valid values, invalid values ]
        [
            ['string', messages.invalidTypeString],
            ['somestring', ''],
            [undefined, null, 1, {}, () => {}, true, []]
        ],
        [
            ['number', messages.invalidTypeNumber],
            [1, 1e3, .25, 0xa1],
            [undefined, null, 'string', {}, () => {}, true, []]
        ]
    ]
        .forEach(([[type, message], validValues, invalidValues]) =>
            it(`isType(${type})`, () => {
                validValues.forEach(value => {
                    expect(isType(type)(value)).to.eql(
                        {
                            result: true,
                            message
                        }
                    )
                });
                invalidValues.forEach(value => {
                    expect(isType(type)(value)).to.eql(
                        {
                            result: false,
                            message
                        }
                    )
                });
            })
        );
});
