const mocha = require('mocha');
const expect = require('chai').expect;
const { shapeOf, arrayOf, isType, messages, or, and, isRequired } = require('../dist/validator');

describe('Complex objects', () => {
    const isString = isType('string');
    const isStringMessage = messages['invalidType.string'];
    const isRequiredMessage = messages.isRequired;

    describe('Objects', () => {
        it('Empty shape, empty input', () => {
            const validate = shapeOf();
            expect(
                validate()
            )
                .to.eql(
                    {
                        result: true,
                        message: {},
                    }
                )
        });
        it('Empty shape, nonempty input', () => {
            const validate = shapeOf();
            expect(
                validate({ foo: 'bar' })
            )
                .to.eql(
                    {
                        result: true,
                        message: {},
                    }
                )
        });
        it('Flat #1', () => {
            const validate = shapeOf(
                {
                    foo: isString,
                }
            );
            expect(
                validate(
                    {
                        foo: 'bar',
                        bar: 'foo',
                    }
                )
            )
                .to.eql(
                    {
                        result: true,
                        message: {},
                    }
                )
        });
        it('Flat #2', () => {
            const validate = shapeOf(
                {
                    foo: isString,
                }
            );
            expect(
                validate(
                    {
                        foo: 1,
                        bar: 'foo',
                    }
                )
            )
                .to.eql(
                    {
                        result: false,
                        message: {
                            foo: [isStringMessage]
                        },
                    }
                )
        });
        it('Subobject (invalid 2lvl value)', () => {
            const validate = shapeOf(
                {
                    foo: isString,
                    subobject: shapeOf(
                        {
                            foo: isString,
                        }
                    ),
                }
            );
            expect(
                validate(
                    {
                        foo: 'f',
                    }
                )
            )
                .to.eql(
                    {
                        result: false,
                        message: {
                            subobject: {
                                foo: [isStringMessage]
                            }
                        },
                    }
                )
        });
        it('Subobject (valid 2lvl value)', () => {
            const validate = shapeOf(
                {
                    foo: isString,
                    subobject: shapeOf(
                        {
                            foo: isString,
                        }
                    ),
                }
            );
            expect(
                validate(
                    {
                        foo: 'a',
                        subobject: {
                            foo: 'a',
                        },
                    }
                )
            )
                .to.eql(
                    {
                        result: true,
                        message: {},
                    }
                )
        });
        it('??! Subobject & or (invalid 2lvl value)', () => {
            // Mixed output of `or` ([]) vs inner `shapeOf` ({}). 
            const validate = shapeOf(
                {
                    foo: isString,
                    subobject: or([
                        shapeOf(
                            {
                                foo: isString,
                            }
                        ),
                        isString
                    ]),
                }
            );
            expect(
                validate(
                    {
                        foo: 'f',
                    }
                )
            )
                .to.eql(
                    {
                        result: false,
                        message: {
                            subobject: [
                                {
                                    foo: [isStringMessage]
                                },
                                isStringMessage,
                            ]
                        },
                    }
                )
        });
        it('Subsubobject (valid 3lvl value)', () => {
            const validate = shapeOf(
                {
                    foo: isString,
                    subobject: shapeOf(
                        {
                            foo: isString,
                            subobject: shapeOf(
                                {
                                    foo: isString,
                                }
                            ),
                        }
                    ),
                }
            );
            expect(
                validate(
                    {
                        foo: 'a',
                        subobject: {
                            foo: 'a',
                        },
                    }
                )
            )
                .to.eql(
                    {
                        result: false,
                        message: {
                            subobject: {
                                subobject: {
                                    foo: [isStringMessage],
                                },
                            },
                        },
                    }
                )
        });
    });
    describe('Collections', () => {
        it('Array of primitives (invalid)', () => {
            const validate = arrayOf(isString);
            expect(
                validate(
                    [
                        1,
                        'a',
                        1,
                    ]
                )
            )
                .to.eql(
                    {
                        result: false,
                        message: [
                            [isStringMessage],
                            [],
                            [isStringMessage],
                        ],
                    }
                )
        });
        it('Array of primitives (valid)', () => {
            const validate = arrayOf(isString);
            expect(
                validate(
                    [
                        'a',
                        'a',
                        'a',
                    ]
                )
            )
                .to.eql(
                    {
                        result: true,
                        message: [],
                    }
                )
        });
        it('Array of shapes (invalid)', () => {
            const validate = arrayOf(
                shapeOf(
                    {
                        foo: isString
                    }
                )
            );
            expect(
                validate(
                    [
                        {},
                        {
                            foo: 'a'
                        },
                        null,
                    ]
                )
            )
                .to.eql(
                    {
                        result: false,
                        message: [
                            {
                                foo: [isStringMessage],
                            },
                            {},
                            {
                                foo: [isStringMessage],
                            },
                        ],
                    }
                )
        });
        it('Array of shapes (valid)', () => {
            const validate = arrayOf(
                shapeOf(
                    {
                        foo: isString
                    }
                )
            );
            expect(
                validate(
                    [
                        {
                            foo: 'a'
                        },
                        {
                            foo: 'a'
                        },
                        {
                            foo: 'a'
                        },
                    ]
                )
            )
                .to.eql(
                    {
                        result: true,
                        message: [],
                    }
                )
        });
        it('Array of shapes of arrays (invalid)', () => {
            const validate = arrayOf(
                shapeOf(
                    {
                        array: arrayOf(isString)
                    }
                )
            );
            expect(
                validate(
                    [
                        {
                            array: [1],
                        },
                    ]
                )
            )
                .to.eql(
                    {
                        result: false,
                        message: [
                            {
                                array: [
                                    [isStringMessage]
                                ],
                            },
                        ],
                    }
                )
        });
        describe('Required array items', () => {
            it.skip('Using custom validator + and cond', () => {
                // This sux, as the result structure wont be for an `arrayOf`,
                // but for the `and` instead. :|
                // How to output the error for the field, and for it's items?

                // For an array as a required field, it makes sense that
                // at least 1 field is required --> arrayField[0]!
                const validate = and([arrayOf(isString), isRequired()]);
                expect(
                    validate()
                )
                    .to.eql(
                        {
                            result: false,
                            message: [
                                [isStringMessage],
                            ],
                        }
                    )
            });
            it('Using built in Assertion.isRequired', () => {
                const validate = arrayOf(isString).isRequired();
                expect(
                    validate()
                )
                    .to.eql(
                        {
                            result: false,
                            message: [
                                [isRequiredMessage],
                            ],
                        }
                    )
            });
        });
    })
});
