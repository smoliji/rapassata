// const mocha = require('mocha');
// const expect = require('chai').expect;
// const { and, or, isType, arrayOf, shapeOf, messages, isRequired, createAssertion } = require('../dist/validator');

// describe('Logical operators', () => {
//     const isString = isType('string');
//     const isStringMessage = messages['invalidType.string'];
//     const isRequiredMessage = messages.isRequired;
//     const minLength = (min) => createAssertion(
//         {
//             validator: (value) => (value && value.length >= min),
//             message: 'Min length {ARGS[0]}',
//             arguments: [min],
//         }
//     );
//     describe('and', () => {
//         it('Simple', () => {
//             const validate = and([
//                 isString,
//                 isRequired(),
//                 minLength(2)
//             ]);
//             expect(
//                 validate()
//             )
//                 .to.eql(
//                     {
//                         result: false,
//                         message: [
//                             isStringMessage,
//                             isRequiredMessage
//                         ],
//                     }
//                 );
//         });
//     });
// });
