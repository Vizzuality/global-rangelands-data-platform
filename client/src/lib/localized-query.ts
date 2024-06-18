import {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { DEFAULT_LOCALE } from "@/middleware";

import API, { ErrorType } from "@/services/api";
import { useMemo } from "react";

type StrapiDATA = {
  data?: {
    id?: number;
    attributes?: Record<string, unknown>;
  }[];
  meta?: Record<string, unknown>;
};

type Params = {
  /**
   * Relations to return
   */
  populate?: string;

  locale?: string;
};

export const getBySlugId = <T>(id: string, params?: Params, signal?: AbortSignal) => {
  return API<T>({
    url: `/slugify/slugs/${id}`,
    method: "get",
    params,
    signal,
  });
};

export const getBySlugIdQueryKey = (id: string, params?: Params) =>
  [`/slugs/${id}`, ...(params ? [params] : [])] as const;

export const getBySlugIdQueryOptions = <
  TData = Awaited<ReturnType<typeof getBySlugId>>,
  TError = ErrorType<Error>,
>(
  id: string,
  params?: Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBySlugId>>, TError, TData>;
  },
): UseQueryOptions<Awaited<ReturnType<typeof getBySlugId>>, TError, TData> & {
  queryKey?: QueryKey;
} => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getBySlugIdQueryKey(id, params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getBySlugId>>> = ({ signal }) =>
    getBySlugId(id, params, signal);

  return { queryKey, queryFn, enabled: !!id, ...queryOptions };
};

const _isNotFoundError = (error: unknown) => {
  return !!(
    error &&
    typeof error === "object" &&
    "response" in error &&
    !!error.response &&
    typeof error.response === "object" &&
    "status" in error.response &&
    error?.response?.status === 404
  );
};

export const useGetBySlug = <
  TData = Awaited<ReturnType<typeof getBySlugId>>,
  TError = ErrorType<Error>,
>(
  id: string,
  params?: Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBySlugId>>, TError, TData>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = useMemo(
    () =>
      getBySlugIdQueryOptions(id, params, {
        query: {
          retry: (failureCount: number, error) => {
            if (_isNotFoundError(error)) {
              return false;
            }
            return failureCount < 3;
          },
          ...(options?.query as UseQueryOptions<
            Awaited<ReturnType<typeof getBySlugId>>,
            TError,
            TData
          >),
        },
      }),
    [id, params, options],
  );
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  const queryDefaultOptions = getBySlugIdQueryOptions(
    id,
    {
      ...params,
      locale: DEFAULT_LOCALE,
    },
    {
      query: {
        enabled: _isNotFoundError(query.error),
        ...(options?.query as UseQueryOptions<
          Awaited<ReturnType<typeof getBySlugId>>,
          TError,
          TData
        >),
      },
    },
  );

  const queryDefault = useQuery(queryDefaultOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryOptions.queryKey;
  queryDefault.queryKey = queryDefaultOptions.queryKey;

  if (_isNotFoundError(query.error)) {
    return queryDefault;
  }

  return query;
};

/**
 * useGetLocalizedList
 * @param query
 * @returns
 */
export const useGetLocalizedList = <T, E>(query: UseQueryResult<T, E>) => {
  const locale = useLocale();

  const { data } = query as UseQueryResult<StrapiDATA, E>;

  if (Array.isArray(data?.data)) {
    const LOCALE_DATA =
      data?.data?.filter((item) => {
        return item?.attributes?.locale === locale;
      }) ?? [];

    const DEFAULT_DATA =
      data?.data?.filter((item) => {
        return item?.attributes?.locale === DEFAULT_LOCALE;
      }) ?? [];

    const DATA = DEFAULT_DATA.map((item) => {
      const LOCALE_ITEM = LOCALE_DATA.find((localeItem) => {
        return (
          localeItem.attributes?.slug &&
          item.attributes?.slug &&
          localeItem.attributes.slug === item.attributes.slug
        );
      });

      return {
        ...item,
        attributes: {
          ...item.attributes,
          ...LOCALE_ITEM?.attributes,
        },
      };
    });

    return {
      ...query,
      data: {
        ...query.data,
        data: DATA,
      },
    } as unknown as UseQueryResult<T, E>;
  }

  return query;
};
