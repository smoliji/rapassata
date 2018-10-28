# rapassata

Helps to validate anything against a created schema.

[![CircleCI](https://circleci.com/gh/smoliji/rapassata/tree/master.svg?style=shield)](https://circleci.com/gh/smoliji/rapassata/tree/master)

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