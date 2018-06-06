import { traverse } from 'schematic-traverse-node';
import { shape, array } from 'schematic-traverse-node/dist/traverse';
import whenDone from 'schematic-traverse-node/dist/whenDone';

const constant = x => () => x;
const negate = fn => (...args) => !fn(...args);
const toPairs = (obj = {}) => Object.keys(obj)
    .map(key => [key, obj[key]]);
const fromPairs = pairs => pairs.reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
}, {});
const isEmpty = (obj = {}) => !Object.keys(obj).length;

const messages = {
    invalidTypeString: 'Value is not a string',
    invalidTypeNumber: 'Value is not a number',
}

const validResult = true;
const invalidResult = !validResult;
const isValid = invokedValidatable => invokedValidatable.result === validResult;
const isInvalid = negate(isValid);
const T_SHAPE = Symbol('shape');

const defaultValidtorOptions = {
    validator: constant(validResult),
    message: 'Error',
};

const withDefaultValidatorOptions = (validatorOptions) => (
    {
        ...defaultValidtorOptions,
        ...validatorOptions,
    }
)

const createValidatable = (validatorOptions) => {
    validatorOptions = withDefaultValidatorOptions(validatorOptions);
    return (value) =>
        whenDone(
            validatorResult => {
                const invokedValidatable = {
                    result: validatorResult,
                    message: validatorOptions.message,
                }
                return invokedValidatable;
            },
            validatorOptions.validator(value)
        );
};

const combineMessages = (messages) => [].concat(...messages)

const isType = (type) => {
    if (type === 'number') {
        return createValidatable({
            message: messages.invalidTypeNumber,
            validator: x => (typeof x === type),
        });
    }
    if (type === 'string') {
        return createValidatable({
            message: messages.invalidTypeString,
            validator: x => (typeof x === type),
        });
    }
    throw new TypeError(`\`${type}\` is not a valid type check.`);
};

const and = (validatables) =>
    (value) =>
        whenDone(
            invokedValidatables => (
                {
                    result: invokedValidatables.every(isValid),
                    message: combineMessages(
                        invokedValidatables
                            .filter(isInvalid)
                            .map(
                                invokedValidatable => invokedValidatable.message
                            )
                    ),
                }
            ),
            validatables.map(validatable => validatable(value))
        );

const or = (validatables) =>
    (value) =>
        whenDone(
            invokedValidatables => (
                {
                    result: invokedValidatables.some(isValid),
                    message: combineMessages(
                        invokedValidatables
                            .filter(isInvalid)
                            .map(
                                invokedValidatable => invokedValidatable.message
                            )
                    ),
                }
            ),
            validatables.map(validatable => validatable(value))
        );

const shapeOf = (structure) => {
    const exec = shape(
        structure,
        shapeResult => (
            {
                result: isEmpty(structure) || !toPairs(shapeResult)
                    .some(([, invokedValidatable]) => isInvalid(invokedValidatable)),
                message: fromPairs(
                    toPairs(shapeResult)
                        .filter(([, invokedValidatable]) => isInvalid(invokedValidatable))
                        .map(([key, invokedValidatable]) => [
                            key,
                            (typeof invokedValidatable.message === 'object'
                            && !Array.isArray(invokedValidatable.message))
                                ? invokedValidatable.message
                                : combineMessages([invokedValidatable.message])
                        ])
                ),
            }
        )
    );
    // To distinct primitives and shapes
    exec[T_SHAPE] = true;
    return exec;
};

const arrayOf = (itemStructure) =>
    array(
        itemStructure,
        arrayResult => (
            {
                result: !arrayResult.some(isInvalid),
                message: 
                    arrayResult.some(isInvalid)
                        ? arrayResult
                            .map(invokedValidatable =>
                                invokedValidatable.result
                                    ? (itemStructure[T_SHAPE] ? {} : combineMessages())
                                    : (itemStructure[T_SHAPE]
                                        ? invokedValidatable.message
                                        : combineMessages([invokedValidatable.message])
                                    )
                            )
                        : []
            }
        )
    )

export {
    messages,
    isType,
    or,
    and,
    shapeOf,
    arrayOf,
};
// console.log(
    // isType('string')('1'),
    // and([isType('string'), isType('number')])('A')
    // shapeOf(
    //     {
    //         // a: isType('string')
    //         a: shapeOf(
    //             {
    //                 b: isType('number')
    //             }
    //         )
    //     }
    // )(
    //     {
    //         a: null
    //     }
    // )
    // arrayOf(isType('string'))([1, '2'])
// )
