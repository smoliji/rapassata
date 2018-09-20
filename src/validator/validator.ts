import * as Bluebird from 'bluebird';
import { constant, defaults, isNil, matches, values } from 'lodash';
import * as validatorLib from 'validator';
import * as traverse from '../traverse/traverse';

type ConstraintResult = PromiseLike<boolean> | boolean;

interface Constraint {
    (subject?: any): ConstraintResult;
}

interface Assertion {
    (subject?: any): PromiseLike<AssertionResult>;
    required: (isRequired?: boolean, isEmpty?: (subject?: any) => boolean) => Assertion;
    message: (message: string) => Assertion;
}

const defaultIsEmpty = isNil;

interface AssertionDescriptor {
    // The validation function itself. Always a function.
    constraint: Constraint;
    // The error message for the case of failure.
    message: string;
    // Any additional arguments that should be passed con straint invocation.
    // i.e. constraint(subject, ...arguments)
    arguments: any[];
    // The value must not be empty. `isEmpty` specifies the value emptiness.
    required: boolean;
    // Function that specifies a value emptiness
    isEmpty: (item?: any) => boolean;
}

const messages = {
    invalid: 'Value is not valid'
}


const getDefaultAssertionDescriptor = constant(
    {
        constraint: constant(Bluebird.resolve(true)),
        message: messages.invalid,
        arguments: [],
        required: false,
        isEmpty: isNil,
    } as AssertionDescriptor
);

class AssertionResult {
    public readonly message?: string;
    public readonly arguments?: Array<any>;
    constructor(
        public readonly valid: boolean,
        public readonly subject: any,
        descriptor: AssertionDescriptor
    ) {
        this.message = descriptor.message;
        this.arguments = descriptor.arguments;
    }
}

const createAssertion = (data?: Partial<AssertionDescriptor>): Assertion => {
    const descriptor = defaults(
        data,
        getDefaultAssertionDescriptor()
    ) as AssertionDescriptor;
    const { constraint } = descriptor;

    if (typeof constraint !== 'function') {
        throw new TypeError('Constraint must be a Function');
    }

    const assertion = (
        (subject: any) => {
            if (descriptor.required && descriptor.isEmpty(subject)) {
                return Bluebird.resolve(new AssertionResult(false, subject, descriptor));
            }
            if (!descriptor.required && descriptor.isEmpty(subject)) {
                return Bluebird.resolve(new AssertionResult(true, subject, descriptor));
            }
            return Bluebird.resolve()
                .then(() => constraint(subject))
                .then((result) => {
                    return new AssertionResult(result, subject, descriptor)
                });
        }
    ) as any as Assertion;

    // Assertion setters
    // Function available on the assertion and may modify the initial descriptor
    // according to the input data
    assertion.required = (isRequired: boolean = true, isEmpty: (...args: any[]) => boolean = defaultIsEmpty) => {
        descriptor.required = !!isRequired;
        descriptor.isEmpty = isEmpty;
        return assertion;
    };
    assertion.message = (message: string) => {
        descriptor.message = message;
        return assertion;
    };

    return assertion as Assertion;
};

export const validator = (validator: string, args: any[] = [], message?: string) => {
    const constraint = (subject: any) => {
        return (validatorLib as any)[validator](
            isNil(subject) ? '' : String(subject),
            ...args
        );
    };
    return createAssertion(
        {
            constraint,
            arguments: args,
            message,
        }
    );
};

export const custom = (constraint: Constraint) => {
    return createAssertion({ constraint });
};


export const shape = (schema: { [key: string]: Assertion }) => {
    return createAssertion(
        {
            constraint: (subject?: any) =>
                traverse.object(
                    schema,
                    (objectResult: { [key: string]: AssertionResult } ) => {
                        return !values(objectResult).find(matches({ valid: false }))
                    }
                )(subject)
                    .then((x) => !!x),
        }
    );
};
