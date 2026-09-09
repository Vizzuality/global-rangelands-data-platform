import Axios, { AxiosError, AxiosRequestConfig } from "axios";

import { env } from "@/env.mjs";

// On the server a relative URL has no origin to resolve against, and routing a
// server-side request out through nginx would be a pointless round trip. In the
// browser, relative keeps the bundle domain-agnostic.
const baseURL =
  typeof window === "undefined"
    ? process.env.CMS_INTERNAL_API_URL || env.NEXT_PUBLIC_API_URL
    : env.NEXT_PUBLIC_API_URL;

export const AXIOS_INSTANCE = Axios.create({ baseURL });

export const API = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then((response) => response.data);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

// In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
export type ErrorType<Error> = AxiosError<Error>;

export default API;
