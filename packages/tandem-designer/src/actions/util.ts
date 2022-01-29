import { BaseAction } from "./base";
import { Result } from "../state/result";

type Key = string | number;

type Namespaced<
  TName extends Key,
  TNamespace extends Key
> = `${TNamespace}/${TName}`;

type PayloadCreator = ((...args: any) => any) | null;
declare type ActionCreatorsBase = {
  [key: string]: PayloadCreator;
};
type ActionCreator<
  TType,
  TPayloadCreator extends PayloadCreator
> = TPayloadCreator extends (...args: any) => any
  ? (
      ...params: Parameters<TPayloadCreator>
    ) => BaseAction<TType, ReturnType<TPayloadCreator>>
  : () => BaseAction<TType>;
export declare type ActionCreators<
  TCreators extends ActionCreatorsBase,
  TNamespace extends Key
> = {
  [key in keyof TCreators & Key]: ActionCreator<
    Namespaced<key, TNamespace>,
    TCreators[key]
  > & {
    type: Namespaced<key, TNamespace>;
  };
};
/**
 * Action creator factors.
 *
 * Example:
 *
 * export const actions = actionCreators({
 *   somethingHappened: (payload: { name: string }) => payload
 * })
 */
export const actionCreators = <
  TCreators extends Record<string, PayloadCreator>,
  TNamespace extends string
>(
  payloadCreators: TCreators,
  namespace: TNamespace
): ActionCreators<TCreators, TNamespace> => {
  return Object.entries(payloadCreators).reduce(
    (actionCreators, [type, createPayload]) => {
      // create new factory for action types
      const namespacedType = `${namespace}/${type}`;

      const createAction = (...args: any) => ({
        type: namespacedType,
        payload: createPayload && createPayload(...args),
      });

      // specify namespace ot avoid collisions
      createAction.type = namespacedType;

      actionCreators[type] = createAction;

      return actionCreators;
    },
    {}
  ) as ActionCreators<TCreators, TNamespace>;
};

/**
 * export const actions = actionCreators({
 *   somethingHappened: identity as Identity<Payload>,
 * })
 *
 * export type MyAction = ExtractJoinedActionFromCreators<typeof actions>;
 */

export type ExtractJoinedActionFromCreators<
  TCreators extends Record<string, (payload: any) => Object>
> = ReturnType<TCreators[keyof TCreators]>;

/**
 * Shorthand for (v: { name: string }) => v
 *
 * actionCreators({
 *   somethingHappened: identity as Identity<{name: string }>
 * })
 */

export const identity =
  <TPayload>() =>
  (value: TPayload) =>
    value;

/**
 */

export type ResultPayload<TData> = {
  result: Result<TData>;
};
