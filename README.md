# rapassata

Helps to validate anything against a created schema.

[![CircleCI](https://circleci.com/gh/smoliji/rapassata/tree/master.svg?style=shield)](https://circleci.com/gh/smoliji/rapassata/tree/master)[![Coverage Status](https://coveralls.io/repos/github/smoliji/rapassata/badge.svg?branch=master)](https://coveralls.io/github/smoliji/rapassata?branch=master)

```js
import { shape, validator, type } from 'rapassata';

// 1. Define a validation schema using helper functions
//  and validators
const validate = shape(
    {
        email: validator('isEmail').required(),
        address: shape(
            {
                street: type.string(),
                postalCode: type.number(),
            }
        ).required(),
    }
);

// 2. Validate input data
validate({ address: { postalCode: '301' } })
// 3. Retreive the Promised result
    .then(result =>
// {
//   "valid": false,
//   "message": {
//     "email": [
//       "Value is required"
//     ],
//     "address": {
//       "postalCode": [
//         "Value is not valid"
//       ]
//     }
//   },
//   "subject": {
//     "address": {
//       "postalCode": "301"
//     }
//   }
// }
```

## Assertion creators

Assertion is a function, accepting any subject item and decides whether the passsed value is valid and the message that should be passed along if its not. 

- `array(itemAssertion: Assertion): Assertion`. Creates an assertion, where each item of the collection is matched against the `itemAssertion` definition.
- `shape(shapeSchema): Assertion`. Creates an assertion for a generic object. Schema should be defined as { [key: string]: Assertion }.
- `type.string(): Assertion`, `type.boolean()`, `type.number()` create an assertion that matches the subject with `typeof` operator.
- `validator(name, args): Assertion`. Creates an assertion based on [validator](https://npmjs.com/package/validator) package. Subject is automatically cast to string, as validator package does throw an error otherwise.
- `custom(fn, msg): Assertion` can be used to create an assertion from a custom function, that accepts the subject and responds/resolves with true/false.
- `and(...assertions): Assertion`. Composes an assertion of many assertions. Each assertion is called sequentially, first to fail fails the composed assertion. Does not work with shape an array assertions.
### Required

Most assertions have a `.required()` method to make the value required.

By default, `null` and `undefined` are considered empty for required fields.
