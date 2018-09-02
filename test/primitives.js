const mocha = require('mocha');
const expect = require('chai').expect;
const { isType, messages, oneOf } = require('../dist/validator');

describe('Primitives', () => {
    [
        // triplets of
        // [ type&message, valid values, invalid values ]
        [
            ['string', messages['invalidType.string']],
            ['somestring', ''],
            [undefined, null, 1, {}, () => {}, true, []]
        ],
        [
            ['number', messages['invalidType.number']],
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
    it('oneOf', () => {
        const match = oneOf([1, '2', null]);
        const message = 'Value is none of 1, 2, null';
        expect(match(null)).to.eql({ result: true, message });
        expect(match(1)).to.eql({ result: true, message });
        expect(match(2)).to.eql({ result: false, message });
        expect(match('2')).to.eql({ result: true, message });
        expect(match({})).to.eql({ result: false, message });
    });
    describe('isRequired', () => {
        it('Empty value - value is required', () => {
            const isString = isType('string');
            const validate = isString.isRequired();
            expect(
                validate()
            )
                .to.eql(
                    {
                        result: false,
                        message: 'Value is required'
                    }
                );
        });
        it('Non-Empty value - error is from inner validator', () => {
            const isString = isType('string');
            const validate = isString.isRequired();
            expect(
                validate('123')
            )
                .to.eql(
                    {
                        result: true,
                        message: messages['invalidType.string']
                    }
                );
        });
    });
});
