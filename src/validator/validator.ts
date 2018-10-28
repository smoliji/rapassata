import * as Bluebird from 'bluebird';
import { constant, defaults, flow, isNil, matches, values, pickBy, isEmpty, mapValues } from 'lodash';
import * as validatorLib from 'validator';
import * as traverse from '../traverse/traverse';

type ErrorMessage = any;
type Constraint = (subject?: any) => PromiseLike<boolean> | boolean;

type AssertionFunction = (subject?: any) => PromiseLike<AssertionResult>

interface Assertion extends AssertionFunction {
    msg: ErrorMessage;
}

const defaultIsEmpty = isNil;

interface AssertionDescriptor {
    // The validation function itself. Always a function.
    constraint: Constraint;
    // The error message for the case of failure.
    message: string;
}

export const messages = {
    invalid: 'Value is not valid',
    required: 'Value is required',
}


const getDefaultAssertionDescriptor = constant(
    {
        constraint: constant(Bluebird.resolve(true)),
        message: messages.invalid,
    } as AssertionDescriptor
);

interface AssertionResult {
    readonly message: ErrorMessage;
    readonly valid: boolean;
    readonly subject: any;
}

// class AssertionResult {
//     public descriptor?: AssertionDescriptor;
//     public subject?: any;
//     constructor(
//         public readonly valid: boolean,
//         public readonly message?: any
//     ) { }
// }

// class IntermediateAssertionResult {
//     constructor(
//         public readonly valid: boolean,
//         public readonly result: any
//     ) {}
// }



class Assertion {
    // static withEmptyValidation = (descriptor: AssertionDescriptor) =>
    //     (wrappedFn: AssertionFunction): AssertionFunction =>
    //         (subject?: any) => {
    //             if (!descriptor.isEmpty(subject)) {
    //                 return wrappedFn(subject);
    //             }
    //             const result = new AssertionResult(!descriptor.required, descriptor.message);
    //             result.descriptor = descriptor;
    //             result.subject = subject;
    //             return Bluebird.resolve(result);
    //         }
}

// interface MessageEditableAssertion extends Assertion {
//     message: (message: any) => Assertion;
// }

type MessageFunction<T> = (msg: any) => T;

const createMessageEditable = () => <T extends Assertion>(wrappedAssertion: T) => {
    let message = messages.invalid;
    const assertion: AssertionFunction = (subject?: any) => {
        return wrappedAssertion(subject)
            .then(result => {
                return {
                    ...result,
                    message: result.valid ? result.message : [message],
                };
            });
    };
    return Object.assign(
        assertion,
        wrappedAssertion,
        {
            message: (msg: any) => {
                message = msg;
                return assertion;
            }
        }
    ) as T & { message: MessageFunction<T> };
};

type RequiredFunction<T> = (isRequired?: boolean, isEmpty?: (subject?: any) => boolean) => T;

const createRequireable = (requiredMessage: any = messages.required) => <T extends Assertion>(wrappedAssertion: T) => {
    let isRequired: boolean = false;
    let isEmpty: (...args: any[]) => boolean = defaultIsEmpty;
    const assertion: AssertionFunction = (subject?: any) => {
        if (isEmpty(subject)) {
            if (isRequired) {
                return Bluebird.resolve({
                    valid: false,
                    message: requiredMessage,
                    subject,
                });
            }
            return Bluebird.resolve({
                valid: true,
                message: wrappedAssertion.msg,
                subject,
            });
        }
        return wrappedAssertion(subject);
    };
    return Object.assign(
        assertion,
        wrappedAssertion,
        {
            required: (required = true, compareEmpty = defaultIsEmpty) => {
                isRequired = required;
                isEmpty = compareEmpty;
                return assertion;
            },
        },
    ) as T & { required: RequiredFunction<T> };
};

const createAssertion = (constraint: Constraint, message: any = messages.invalid): Assertion => {
    if (typeof constraint !== 'function') {
        throw new TypeError('Constraint must be a Function');
    }

    return Object.assign(
        (subject: any) => {
            return Bluebird.resolve()
                .then(() => constraint(subject))
                .then(valid => ({ valid, message: valid ? [] : [message], subject }));
        },
        {
            msg: message,
        }
    );
};

export const validator = (validator: string, args: any[] = [], message?: string) => {
    const constraint = (subject: any) => {
        return (validatorLib as any)[validator](
            isNil(subject) ? '' : String(subject),
            ...args
        );
    };
    // Dafuq, TS, not again >:o
    // return flow(createRequireable(),createMessageEditable())(createAssertion(constraint));
    return createRequireable()(createMessageEditable()(createAssertion(constraint, message)));
};

export const custom = (constraint: Constraint, message?: any) => {
    return createRequireable()(createMessageEditable()(createAssertion(constraint, message)));
};

export const shape = (schema: { [key: string]: Assertion }) => {
    const assertion: Assertion = Object.assign(
        (subject?: any) => {
            return traverse.object(
                schema,
                (objectResult: { [key: string]: AssertionResult } ) => {
                    const invalidProps = pickBy(
                        objectResult,
                        (value) => !value.valid
                    );
                    return {
                        valid: isEmpty(invalidProps),
                        message: mapValues(invalidProps, (value: AssertionResult) => value.message),
                        subject,
                    };
                }
            )(subject);
        },
        {
            msg: mapValues(
                schema,
                (value) => value.msg
            )
        }
    );
    return createRequireable({ _error: [messages.required] })(assertion);
};

export const arrayOf = (itemSchema: Assertion) => {
    const assertion: Assertion = Object.assign(
        (subject?: any) => {
            return traverse.array(
                itemSchema,
                (items: AssertionResult[]) => {
                    const valid = !items.find(matches({ valid: false }));
                    return {
                        valid,
                        message: valid
                            ? []
                            : items.map(item => item.message),
                        subject,
                    };
                }
            )(subject);
        },
        {
            msg: [itemSchema.msg]
        }
    );
    return assertion;
};
