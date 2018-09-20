
import { validator, custom, shape } from './validator';

describe('ValidatorJS', () => {
    it('Uses validatorJS', () => {
        expect.assertions(1);
        return expect(validator('isEmail')('aaa'))
            .resolves.toHaveProperty('valid', false);
    });
    it('Automatic coercion', () => {
        // validator lib throws error on any input that is not a string
        // This validator lib sanitizes the input automatically
        expect.assertions(1);
        return expect(validator('isEmail')(123))
            .resolves.toHaveProperty('valid', false)
    });
    it('Argument passing', () => {
        expect.assertions(2);
        return Promise.all([
            expect(validator('isLength', [{ min: 2 }])('.'))
                .resolves.toHaveProperty('valid', false),
            expect(validator('isLength', [{ min: 2 }])('..'))
                .resolves.toHaveProperty('valid', true),
        ]);
    });
});

describe('Required', () => {
    [
        undefined,
        null,
    ]
        .forEach(tvalue => {
            it(`Default behaviour: not required => passes if \`${tvalue}\``, () => {
                expect.assertions(1);
                return expect(validator('isLength', [{ min: 1 }])(tvalue))
                        .resolves.toHaveProperty('valid', true);
            });
        });
    [
        '',
        true,
        false,
        0
    ]
        .forEach(tvalue => {
            it(`Default behaviour: not required => validator applies if \`${tvalue}\``, () => {
                expect.assertions(1);
                return expect(validator('isLength', [{ min: 10 }])(tvalue))
                    .resolves.toHaveProperty('valid', false);
            });
        });

    it('Custom empty function', () => {
        const isEmpty = (x: any) => (x === undefined || x === null);
        expect.assertions(3);
        return Promise.all([
            expect(validator('isLength', [{ min: 1 }]).required(false, isEmpty)())
                .resolves.toHaveProperty('valid', true),
            expect(validator('isLength', [{ min: 1 }]).required(false, isEmpty)(null))
                .resolves.toHaveProperty('valid', true),
            expect(validator('isLength', [{ min: 1 }]).required(false, isEmpty)(''))
                .resolves.toHaveProperty('valid', false),
        ]);
    });
    it('.required() -> required', () => {
        expect.assertions(1);
        return expect(validator('isLength', [{ min: 1 }]).required()())
            .resolves.toHaveProperty('valid', false);
    });
    it('.required(true) -> required', () => {
        expect.assertions(1);
        return expect(validator('isLength', [{ min: 1 }]).required(true)())
            .resolves.toHaveProperty('valid', false);
    });
    it('.required(false) -> [default empty-pass behaviour]', () => {
        expect.assertions(1);
        return expect(validator('isLength', [{ min: 1 }]).required(false)())
            .resolves.toHaveProperty('valid', true);
    });
});

it('Cutom validator fn: T', () => {
    const isX = (x: any) => (x === 'x');
    expect.assertions(2);
    return Promise.all([
        expect(custom(isX)('a'))
            .resolves.toHaveProperty('valid', false),
        expect(custom(isX)('x'))
            .resolves.toHaveProperty('valid', true),
    ]);
});

it('Cutom message', () => {
    const isX = (x: any) => (x === 'x');
    const message = 'is not x';
    expect.assertions(2);
    const result = custom(isX).message(message)('a');
    return Promise.all([
        expect(result).resolves.toHaveProperty('valid', false),
        expect(result).resolves.toHaveProperty('message', message),
    ]);
});

it('Cutom validator fn: Promise<T>', () => {
    const isX = (x: any) => Promise.resolve((x === 'x'));
    expect.assertions(2);
    return Promise.all([
        expect(custom(isX)('a'))
            .resolves.toHaveProperty('valid', false),
        expect(custom(isX)('x'))
            .resolves.toHaveProperty('valid', true),
    ]);
});

describe.only('Shape', () => {
    const isX = custom((x: any) => (x === 'x')).required();
    [
        undefined,
        null,
    ]
        .forEach(tvalue => {
            it(`\`${tvalue}\` -> no validations are applied`, () => {
                return expect(
                        shape({ x: isX })(tvalue)
                ).resolves.toHaveProperty('valid', true);
            });
        });
    it('Basic shape by description', () => {
        const result = shape(
            {
                x: isX,
            }
        )({ x: 'notx' });
        return Promise.all([
            expect(result).resolves.toHaveProperty('valid', false),
            // TODO How to set the message?!
            result.then(console.log)
        ])
    })
});

