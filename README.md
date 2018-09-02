# schematic-validator

> Validate an object against a given schema

```js
const { shapeOf } = require('schematic-validator');

// 1. Define a validation schema using helper functions
//  and validators
const validate = shapeOf(
    {
        email: and([isEmail, isRequired]),
        address: shapeOf(
            {
                street: isString,
                postalCode: isNumber,
            }
        )
    }
);

validate({});

// {
//   "result": false,
//   "message": {
//     "email": [
//       "Is not an email"
//     ],
//     "address": {
//       "street": [
//         "Is not a string"
//       ],
//       "postalCode": [
//         "Is not a number"
//       ]
//     }
//   }
// }
```

## API

###