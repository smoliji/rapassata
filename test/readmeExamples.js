// const mocha = require('mocha');
// const expect = require('chai').expect;

// describe('Readme examples', () => {
//     it('#1', () => {
//         const { and, shapeOf, arrayOf, createAssertion } = require('../dist/validator');
//         const identity = x => x;
//         const isEmail = createAssertion(
//             {
//                 message: 'Is not an email',
//                 validator: 'isEmail',
//             }
//         );
//         const isString = createAssertion(
//             {
//                 message: 'Is not a string',
//                 validator: 'isAlphanumeric',
//             }
//         );
//         const isNumber = createAssertion(
//             {
//                 message: 'Is not a number',
//                 validator: 'isNumeric',
//                 passIfEmpty: false
//             }
//         );
//         const endsWith = (end) => createAssertion(
//             {
//                 message: 'Does not end with {ARGS[0]}',
//                 validator: (value) => (console.log({ value }), String(value).endsWith(end)),
//                 arguments: [end],
//             }
//         )

//         const validate = shapeOf(
//             {
//                 email: and([isEmail, endsWith('com')]),
//                 address: shapeOf(
//                     {
//                         street: isString,
//                         postalCode: isNumber,
//                     }
//                 ),
//                 tags: arrayOf(isString).isRequired(),
//             }
//         );
//         expect(
//             validate(
//                 {}
//             )
//         ).to.eql(
//             {
//                 result: false,
//                 message: {
//                     email: ['Is not an email'],
//                     address: {
//                         street: ['Is not a string'],
//                         postalCode: ['Is not a number'],
//                     },
//                     tags: [
//                         ['Value is required'],
//                     ],
//                 },
//             }
//         )
//     });
// });