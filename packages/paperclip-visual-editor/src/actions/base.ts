export type BaseAction<TType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
};

type ExtractType<TAction> = TAction extends BaseAction<infer TType, any>
  ? TType
  : never;
type ExtractPayload<TAction> = TAction extends BaseAction<any, infer TPayload>
  ? TPayload
  : never;

export const actionCreator = <TAction>(type: ExtractType<TAction>) => (
  payload: ExtractPayload<TAction>
) => ({
  type,
  payload
});
