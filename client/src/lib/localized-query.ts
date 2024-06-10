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
    queryKey: QueryKey;
} => {
    const { query: queryOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getBySlugIdQueryKey(id, params);

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getBySlugId>>> = ({ signal }) =>
        getBySlugId(id, params, signal);

    return { queryKey, queryFn, enabled: !!id, ...queryOptions };
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
    const queryOptions = getBySlugIdQueryOptions(id, params, options);
    const queryDefaultOptions = getBySlugIdQueryOptions(
        id,
        {
            ...params,
            locale: DEFAULT_LOCALE,
        },
        options,
    );

    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
    const queryDefault = useQuery(queryDefaultOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };

    query.queryKey = queryOptions.queryKey;
    queryDefault.queryKey = queryDefaultOptions.queryKey;

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
