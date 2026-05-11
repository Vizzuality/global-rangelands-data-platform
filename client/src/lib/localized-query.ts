import {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { DEFAULT_LOCALE } from "@/i18n/routing";

import API, { ErrorType } from "@/services/api";
import { useMemo } from "react";
import {
  DefaultLegendComponent,
  DefaultLegendComponentItemsItem,
} from "@/types/generated/strapi.schemas";

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
  populate?: string | string[];

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

type Translation = {
  locale: string;
  id: number;
} & Record<string, string>;

type AttributesWithTranslations =
  | ({
      translations?: Translation[];
    } & Record<string, unknown>)
  | undefined;

type ResponseData = {
  data?: {
    id: number;
    attributes?: AttributesWithTranslations;
  };
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
  const { locale, ...restParams } = params ?? {};
  const queryOptions = useMemo(
    () =>
      getBySlugIdQueryOptions(id, restParams, {
        query: {
          // @ts-expect-error: select is not well typed
          select: (response) => {
            const data = response as ResponseData;
            const attributes = data?.data?.attributes;
            const translated = attributes?.translations?.find(
              (t: Record<string, string>) => t.locale === locale,
            );
            const { id, ...translatedAtt } = translated || {};

            return {
              ...data,
              data: {
                ...data.data,
                attributes: {
                  ...attributes,
                  ...translatedAtt,
                },
              },
            };
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
    const LOCALE_DATA = data.data.map((item) => {
      const { translations, ...attributes } =
        (item?.attributes as AttributesWithTranslations) || {};
      const localeTranslation = translations?.find((translation) => {
        return translation.locale === locale;
      });
      const { id, ...translatedAtt } = localeTranslation || {};

      const legendUnit =
        (attributes?.legend &&
          (attributes?.legend as DefaultLegendComponent)?.[
            `unit_${locale}` as keyof DefaultLegendComponent
          ]) ||
        (attributes?.legend as DefaultLegendComponent)?.unit;

      const legendItems = (attributes?.legend as DefaultLegendComponent)?.items?.map((i) => {
        const localeName = i[`name_${locale}` as keyof DefaultLegendComponentItemsItem];
        const legendItemName =
          locale === DEFAULT_LOCALE || !localeName
            ? i.name
            : i[`name_${locale}` as keyof DefaultLegendComponentItemsItem];

        return {
          color: i.color,
          id: i.id,
          name: legendItemName,
        };
      });

      const legend = attributes.legend
        ? {
            ...attributes.legend,
            unit: legendUnit,
            items: legendItems,
          }
        : {};

      return {
        ...item,
        attributes: {
          ...attributes,
          ...translatedAtt,
          ...(legend ? { legend } : {}),
        },
      };
    });

    return {
      ...query,
      data: {
        ...query.data,
        data: locale === DEFAULT_LOCALE ? data.data : LOCALE_DATA,
      },
    } as unknown as UseQueryResult<T, E>;
  }

  return query;
};
