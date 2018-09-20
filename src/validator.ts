// import { traverse } from 'schematic-traverse-node';
// import { shape, array } from 'schematic-traverse-node/dist/traverse';
// import whenDone from 'schematic-traverse-node/dist/whenDone';
// import * as mongooseValidator from 'mongoose-validator';

// const constant = x => () => x;
// const identity = (x) => x;
// const negate = fn => (...args) => !fn(...args);
// const toPairs = (obj = {}) => Object.keys(obj)
//     .map(key => [key, obj[key]]);
// const fromPairs = pairs => pairs.reduce((obj, [key, value]) => {
//     obj[key] = value;
//     return obj;
// }, {});
// const isEmpty = (obj = {}) => !Object.keys(obj).length;
// const defaultIsValueEmpty = (value) => (
//     value === null
//     || value === undefined
//     || (typeof value === 'object' && isEmpty(value))
// );

// const messages = {
//     'invalidType.string': 'Value is not a string',
//     'invalidType.number': 'Value is not a number',
//     'invalidType.boolean': 'Value is not a boolean',
//     'invalidType.object': 'Value is not a object',
//     noneOf: 'Value is none of {ARGS[0]}',
//     isRequired: 'Value is required',
// }

// const validResult = true;
// const invalidResult = !validResult;
// const isValid = invokedValidatable => invokedValidatable.result === validResult;
// const isInvalid = negate(isValid);
// const T_SHAPE = Symbol('shape');

// const defaultValidtorOptions = {
//     noMongoose: false,
//     validator: constant(validResult),
//     message: 'Error',
// };

// const withDefaultValidatorOptions = (validatorOptions) => (
//     {
//         ...defaultValidtorOptions,
//         ...validatorOptions,
//     }
// );

// const cast = (validatable, type, defaultVal = '') =>
//     (value, ...rest) => validatable(type(value || defaultVal), ...rest);

// const createAssertion = (iniValidatorOptions) => {
//     const fullValidatorOpts = withDefaultValidatorOptions(iniValidatorOptions);
//     const validatorOptions = (fullValidatorOpts.noMongoose ? identity : mongooseValidator)(fullValidatorOpts);
//     // Cast validator.js validators inputs to string to prevent the error thrown
//     if (iniValidatorOptions && (typeof iniValidatorOptions.validator === 'string')) {
//         validatorOptions.validator = cast(validatorOptions.validator, String);
//     }
//     const assertion = (value) =>
//         whenDone(
//             validatorResult => {
//                 const invokedValidatable = {
//                     result: validatorResult,
//                     message: validatorOptions.message,
//                 }
//                 return invokedValidatable;
//             },
//             validatorOptions.validator(value)
//         );

//     assertion.isRequired = (isValueEmpty) => {
//         return (value) => {
//             const requiredResult = isRequired(isValueEmpty)(value);
//             if (!requiredResult.result) {
//                 return {
//                     result: requiredResult.result,
//                     message: requiredResult.message,
//                 };
//             }
//             return assertion(value);
//         };
//     };

//     return assertion;
// };

// const combineMessages = (messages) => [].concat(...messages);

// const oneOf = (alts) =>
//     createAssertion(
//         {
//             message: messages.noneOf,
//             arguments: [alts.map(String).join(', ')],
//             validator: value => alts.includes(value),
//         }
//     );

// const isType = (type) => {
//     // Validators have to bypass the mongoose validators,
//     // otherwise validator funcs wont be called on e.g. undefined values
//     return createAssertion(
//         {
//             message: messages[`invalidType.${type}`],
//             validator: x => (typeof x === type),
//             noMongoose: true,
//         },
//     );
// };

// const isRequired = (
//     isValueEmpty = defaultIsValueEmpty
// ) => (value) => {
//     return {
//         result: !isValueEmpty(value),
//         message: messages.isRequired,
//     };
// };

// const and = (validatables) =>
//     (value) =>
//         whenDone(
//             invokedValidatables => (
//                 {
//                     result: invokedValidatables.every(isValid),
//                     message: combineMessages(
//                         invokedValidatables
//                             .filter(isInvalid)
//                             .map(
//                                 invokedValidatable => invokedValidatable.message
//                             )
//                     ),
//                 }
//             ),
//             validatables.map(validatable => validatable(value))
//         );

// const or = (validatables) =>
//     (value) =>
//         whenDone(
//             invokedValidatables => (
//                 {
//                     result: invokedValidatables.some(isValid),
//                     message: combineMessages(
//                         invokedValidatables
//                             .filter(isInvalid)
//                             .map(
//                                 invokedValidatable => invokedValidatable.message
//                             )
//                     ),
//                 }
//             ),
//             validatables.map(validatable => validatable(value))
//         );

// const shapeOf = (structure) => {
//     const exec = shape(
//         structure,
//         shapeResult => (
//             {
//                 result: isEmpty(structure) || !toPairs(shapeResult)
//                     .some(([, invokedValidatable]) => isInvalid(invokedValidatable)),
//                 message: fromPairs(
//                     toPairs(shapeResult)
//                         .filter(([, invokedValidatable]) => isInvalid(invokedValidatable))
//                         .map(([key, invokedValidatable]) => [
//                             key,
//                             (typeof invokedValidatable.message === 'object'
//                             && !Array.isArray(invokedValidatable.message))
//                                 ? invokedValidatable.message
//                                 : combineMessages([invokedValidatable.message])
//                         ])
//                 ),
//             }
//         )
//     );
//     // To distinct primitives and shapes
//     exec[T_SHAPE] = true;
//     return exec;
// };

// const arrayOf = (itemStructure) => {
//     const validateMembers = array(
//         itemStructure,
//         arrayResult => (
//             {
//                 result: !arrayResult.some(isInvalid),
//                 message: 
//                     arrayResult.some(isInvalid)
//                         ? arrayResult
//                             .map(invokedValidatable =>
//                                 invokedValidatable.result
//                                     // Array of objects vs array of anything else:
//                                     // Object empty={}, otherwise=[]
//                                     ? (itemStructure[T_SHAPE] ? {} : combineMessages())
//                                     : (itemStructure[T_SHAPE]
//                                         ? invokedValidatable.message
//                                         : combineMessages([invokedValidatable.message])
//                                     )
//                             )
//                         : []
//             }
//         )
//     );
//     validateMembers.isRequired = (isValueEmpty) => {
//         return (value) => {
//             const requiredResult = isRequired(isValueEmpty)(value);
//             if (!requiredResult.result) {
//                 return {
//                     result: requiredResult.result,
//                     message: [
//                         combineMessages([requiredResult.message]),
//                     ],
//                 };
//             }
//             return validateMembers(value);
//         };
//     };
//     return validateMembers;
// };

// export {
//     createAssertion,
//     messages,
//     isType,
//     isRequired,
//     or,
//     and,
//     shapeOf,
//     arrayOf,
//     oneOf,
//     cast,
// };
