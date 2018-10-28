import { identity, mapValues, isArray } from 'lodash';
import * as Bluebird from 'bluebird';

export type TraverseFunction<T> = (subject: any) => PromiseLike<T>;
type Iteratee<T> = (x: any) => T;

export interface ObjectSchema {
    [key: string]: TraverseFunction<any>
}

export const primitive = <Remap>(iteratee: Iteratee<Remap> = identity) => {
    return (subject?: any) => Bluebird.resolve(iteratee(subject))
};

export const object = <In extends { [key: string]: any }, Remap>(schema: ObjectSchema = {}, iteratee: Iteratee<Remap> = identity) =>
    (subject?: In | null) =>
        Bluebird.props(
            mapValues(
                schema,
                (traverse, key) => (traverse as TraverseFunction<any>)((subject || {} as any)[key])
            )
        )
            .then(iteratee) as any as PromiseLike<Remap>;



export const array = <In extends Array<any>, Remap>(itemSchema: TraverseFunction<any> = identity, iteratee: Iteratee<Remap> = identity) =>
    (subject?: In | null | any) =>
        Bluebird.all(
            isArray(subject) ? subject.map(itemSchema) : []
        )
            .then(iteratee) as any as PromiseLike<Remap>;
