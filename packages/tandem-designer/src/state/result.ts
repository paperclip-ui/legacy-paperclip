export type Result<TData> = {
  data?: TData;
  loaded: boolean;
  error?: Error;

  // used for TTL caching
  createdAt?: number;
};
