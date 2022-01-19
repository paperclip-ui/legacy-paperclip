import { Result } from "../state/result";

export type BaseAction<TType, TPayload = undefined> = {
  type: TType;
  payload: TPayload;
  public: boolean;
};

export type BaseRequestStateChanged<
  TType extends string,
  TData,
  TPayload = {}
> = BaseAction<TType, TPayload & { result: Result<TData> }>;

export const actionCreator =
  <TAction extends BaseAction<any, any>>(type: TAction["type"]) =>
  (payload: TAction["payload"]) => ({
    type,
    payload,
    public: false,
  });

export const publicActionCreator =
  <TAction extends BaseAction<any, any>>(type: TAction["type"]) =>
  (payload: TAction["payload"]) => ({
    type,
    payload,
    public: true,
  });

export const createErrorResult = (error: Error): Result<any> => ({
  error,
  data: undefined,
  loaded: true,
  createdAt: Date.now(),
});
export const createDataResult = <TData>(data: TData): Result<TData> => ({
  data,
  loaded: true,
  createdAt: Date.now(),
});

export const createLoadingResult = (): Result<any> => ({
  error: undefined,
  loaded: false,
  createdAt: Date.now(),
});
