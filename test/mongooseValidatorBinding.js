// const mocha = require('mocha');
// const expect = require('chai').expect;

// describe('Mongoose-validator bindings', () => {
//     it('String validators', () => {
//         const { createAssertion } = require('../dist/validator');
//         const isEmail = createAssertion(
//             {
//                 message: 'Is not an email',
//                 validator: 'isEmail',
//             }
//         );
//         expect(
//             isEmail('')
//         ).to.eql(
//             {
//                 result: false,
//                 message: 'Is not an email',
//             }
//         )
//     });
//     it('passIfEmpty', () => {
//         const { createAssertion } = require('../dist/validator');
//         const isEmail = createAssertion(
//             {
//                 message: 'Is not an email',
//                 validator: 'isEmail',
//                 passIfEmpty: true,
//             }
//         );
//         expect(
//             isEmail(null)
//         ).to.eql(
//             {
//                 result: true,
//                 message: 'Is not an email',
//             }
//         )
//     });
//     it('Args', () => {
//         const { createAssertion } = require('../dist/validator');
//         const isLength = createAssertion(
//             {
//                 arguments: [2, 50],
//                 message: 'Should be between {ARGS[0]} and {ARGS[1]} characters',
//                 validator: 'isLength',
//             }
//         );
//         expect(
//             isLength('')
//         ).to.eql(
//             {
//                 result: false,
//                 message: 'Should be between 2 and 50 characters',
//             }
//         );
//     });
//     it('Cast to string if passed to a validator.js', () => {
//         // Validator.js - undeerlying validation library executed on
//         // a string validator - throws an exception when a non string is passed
//         // this lib automatically wraps the validator and casts the input to a string
//         const { createAssertion } = require('../dist/validator');
//         const isLength = createAssertion(
//             {
//                 arguments: [2, 50],
//                 message: 'Should be between {ARGS[0]} and {ARGS[1]} characters',
//                 validator: 'isLength',
//                 passIfEmpty: false,
//             }
//         );
//         expect(
//             isLength(1)
//         ).to.eql(
//             {
//                 result: false,
//                 message: 'Should be between 2 and 50 characters',
//             }
//         );
//     });
// });