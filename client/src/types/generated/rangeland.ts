/**
 * Generated by orval v6.29.1 🍺
 * Do not edit manually.
 * DOCUMENTATION
 * OpenAPI spec version: 1.0.0
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type {
  Error,
  GetRangelandsIdParams,
  GetRangelandsParams,
  RangelandListResponse,
  RangelandLocalizationRequest,
  RangelandLocalizationResponse,
  RangelandRequest,
  RangelandResponse,
} from "./strapi.schemas";
import { API } from "../../services/api/index";
import type { ErrorType } from "../../services/api/index";

type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];

export const getRangelands = (
  params?: GetRangelandsParams,
  options?: SecondParameter<typeof API>,
  signal?: AbortSignal,
) => {
  return API<RangelandListResponse>({ url: `/rangelands`, method: "GET", params, signal }, options);
};

export const getGetRangelandsQueryKey = (params?: GetRangelandsParams) => {
  return [`/rangelands`, ...(params ? [params] : [])] as const;
};

export const getGetRangelandsQueryOptions = <
  TData = Awaited<ReturnType<typeof getRangelands>>,
  TError = ErrorType<Error>,
>(
  params?: GetRangelandsParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getRangelands>>, TError, TData>>;
    request?: SecondParameter<typeof API>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetRangelandsQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getRangelands>>> = ({ signal }) =>
    getRangelands(params, requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getRangelands>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetRangelandsQueryResult = NonNullable<Awaited<ReturnType<typeof getRangelands>>>;
export type GetRangelandsQueryError = ErrorType<Error>;

export const useGetRangelands = <
  TData = Awaited<ReturnType<typeof getRangelands>>,
  TError = ErrorType<Error>,
>(
  params?: GetRangelandsParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getRangelands>>, TError, TData>>;
    request?: SecondParameter<typeof API>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetRangelandsQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

export const postRangelands = (
  rangelandRequest: RangelandRequest,
  options?: SecondParameter<typeof API>,
) => {
  return API<RangelandResponse>(
    {
      url: `/rangelands`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: rangelandRequest,
    },
    options,
  );
};

export const getPostRangelandsMutationOptions = <
  TError = ErrorType<Error>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postRangelands>>,
    TError,
    { data: RangelandRequest },
    TContext
  >;
  request?: SecondParameter<typeof API>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof postRangelands>>,
  TError,
  { data: RangelandRequest },
  TContext
> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postRangelands>>,
    { data: RangelandRequest }
  > = (props) => {
    const { data } = props ?? {};

    return postRangelands(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type PostRangelandsMutationResult = NonNullable<Awaited<ReturnType<typeof postRangelands>>>;
export type PostRangelandsMutationBody = RangelandRequest;
export type PostRangelandsMutationError = ErrorType<Error>;

export const usePostRangelands = <TError = ErrorType<Error>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postRangelands>>,
    TError,
    { data: RangelandRequest },
    TContext
  >;
  request?: SecondParameter<typeof API>;
}): UseMutationResult<
  Awaited<ReturnType<typeof postRangelands>>,
  TError,
  { data: RangelandRequest },
  TContext
> => {
  const mutationOptions = getPostRangelandsMutationOptions(options);

  return useMutation(mutationOptions);
};
export const getRangelandsId = (
  id: number,
  params?: GetRangelandsIdParams,
  options?: SecondParameter<typeof API>,
  signal?: AbortSignal,
) => {
  return API<RangelandResponse>(
    { url: `/rangelands/${id}`, method: "GET", params, signal },
    options,
  );
};

export const getGetRangelandsIdQueryKey = (id: number, params?: GetRangelandsIdParams) => {
  return [`/rangelands/${id}`, ...(params ? [params] : [])] as const;
};

export const getGetRangelandsIdQueryOptions = <
  TData = Awaited<ReturnType<typeof getRangelandsId>>,
  TError = ErrorType<Error>,
>(
  id: number,
  params?: GetRangelandsIdParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getRangelandsId>>, TError, TData>>;
    request?: SecondParameter<typeof API>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetRangelandsIdQueryKey(id, params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getRangelandsId>>> = ({ signal }) =>
    getRangelandsId(id, params, requestOptions, signal);

  return { queryKey, queryFn, enabled: !!id, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getRangelandsId>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetRangelandsIdQueryResult = NonNullable<Awaited<ReturnType<typeof getRangelandsId>>>;
export type GetRangelandsIdQueryError = ErrorType<Error>;

export const useGetRangelandsId = <
  TData = Awaited<ReturnType<typeof getRangelandsId>>,
  TError = ErrorType<Error>,
>(
  id: number,
  params?: GetRangelandsIdParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getRangelandsId>>, TError, TData>>;
    request?: SecondParameter<typeof API>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetRangelandsIdQueryOptions(id, params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

export const putRangelandsId = (
  id: number,
  rangelandRequest: RangelandRequest,
  options?: SecondParameter<typeof API>,
) => {
  return API<RangelandResponse>(
    {
      url: `/rangelands/${id}`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      data: rangelandRequest,
    },
    options,
  );
};

export const getPutRangelandsIdMutationOptions = <
  TError = ErrorType<Error>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof putRangelandsId>>,
    TError,
    { id: number; data: RangelandRequest },
    TContext
  >;
  request?: SecondParameter<typeof API>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof putRangelandsId>>,
  TError,
  { id: number; data: RangelandRequest },
  TContext
> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof putRangelandsId>>,
    { id: number; data: RangelandRequest }
  > = (props) => {
    const { id, data } = props ?? {};

    return putRangelandsId(id, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type PutRangelandsIdMutationResult = NonNullable<
  Awaited<ReturnType<typeof putRangelandsId>>
>;
export type PutRangelandsIdMutationBody = RangelandRequest;
export type PutRangelandsIdMutationError = ErrorType<Error>;

export const usePutRangelandsId = <TError = ErrorType<Error>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof putRangelandsId>>,
    TError,
    { id: number; data: RangelandRequest },
    TContext
  >;
  request?: SecondParameter<typeof API>;
}): UseMutationResult<
  Awaited<ReturnType<typeof putRangelandsId>>,
  TError,
  { id: number; data: RangelandRequest },
  TContext
> => {
  const mutationOptions = getPutRangelandsIdMutationOptions(options);

  return useMutation(mutationOptions);
};
export const deleteRangelandsId = (id: number, options?: SecondParameter<typeof API>) => {
  return API<number>({ url: `/rangelands/${id}`, method: "DELETE" }, options);
};

export const getDeleteRangelandsIdMutationOptions = <
  TError = ErrorType<Error>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteRangelandsId>>,
    TError,
    { id: number },
    TContext
  >;
  request?: SecondParameter<typeof API>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof deleteRangelandsId>>,
  TError,
  { id: number },
  TContext
> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof deleteRangelandsId>>,
    { id: number }
  > = (props) => {
    const { id } = props ?? {};

    return deleteRangelandsId(id, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type DeleteRangelandsIdMutationResult = NonNullable<
  Awaited<ReturnType<typeof deleteRangelandsId>>
>;

export type DeleteRangelandsIdMutationError = ErrorType<Error>;

export const useDeleteRangelandsId = <TError = ErrorType<Error>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteRangelandsId>>,
    TError,
    { id: number },
    TContext
  >;
  request?: SecondParameter<typeof API>;
}): UseMutationResult<
  Awaited<ReturnType<typeof deleteRangelandsId>>,
  TError,
  { id: number },
  TContext
> => {
  const mutationOptions = getDeleteRangelandsIdMutationOptions(options);

  return useMutation(mutationOptions);
};
export const postRangelandsIdLocalizations = (
  id: number,
  rangelandLocalizationRequest: RangelandLocalizationRequest,
  options?: SecondParameter<typeof API>,
) => {
  return API<RangelandLocalizationResponse>(
    {
      url: `/rangelands/${id}/localizations`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: rangelandLocalizationRequest,
    },
    options,
  );
};

export const getPostRangelandsIdLocalizationsMutationOptions = <
  TError = ErrorType<Error>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postRangelandsIdLocalizations>>,
    TError,
    { id: number; data: RangelandLocalizationRequest },
    TContext
  >;
  request?: SecondParameter<typeof API>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof postRangelandsIdLocalizations>>,
  TError,
  { id: number; data: RangelandLocalizationRequest },
  TContext
> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postRangelandsIdLocalizations>>,
    { id: number; data: RangelandLocalizationRequest }
  > = (props) => {
    const { id, data } = props ?? {};

    return postRangelandsIdLocalizations(id, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type PostRangelandsIdLocalizationsMutationResult = NonNullable<
  Awaited<ReturnType<typeof postRangelandsIdLocalizations>>
>;
export type PostRangelandsIdLocalizationsMutationBody = RangelandLocalizationRequest;
export type PostRangelandsIdLocalizationsMutationError = ErrorType<Error>;

export const usePostRangelandsIdLocalizations = <
  TError = ErrorType<Error>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof postRangelandsIdLocalizations>>,
    TError,
    { id: number; data: RangelandLocalizationRequest },
    TContext
  >;
  request?: SecondParameter<typeof API>;
}): UseMutationResult<
  Awaited<ReturnType<typeof postRangelandsIdLocalizations>>,
  TError,
  { id: number; data: RangelandLocalizationRequest },
  TContext
> => {
  const mutationOptions = getPostRangelandsIdLocalizationsMutationOptions(options);

  return useMutation(mutationOptions);
};
