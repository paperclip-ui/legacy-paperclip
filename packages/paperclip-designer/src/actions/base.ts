export type BaseAction<TType extends string, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
  public: boolean;
};

export const actionCreator = <TAction extends BaseAction<any, any>>(
  type: TAction["type"]
) => (payload: TAction["payload"]) => ({
  type,
  payload,
  public: false
});

export const publicActionCreator = <TAction extends BaseAction<any, any>>(
  type: TAction["type"]
) => (payload: TAction["payload"]) => ({
  type,
  payload,
  public: true
});
