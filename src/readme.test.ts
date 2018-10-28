import { shape, validator, type } from './validator/validator';

it('Readme', () => {
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
    return validate({ address: { postalCode: '301' } })
        .then(result => {
            expect(JSON.stringify(result, null, 2)).toMatch(
`{
  "valid": false,
  "message": {
    "email": [
      "Value is required"
    ],
    "address": {
      "postalCode": [
        "Value is not valid"
      ]
    }
  },
  "subject": {
    "address": {
      "postalCode": "301"
    }
  }
}`
            );
        });
});
