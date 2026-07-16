"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useSyncSearchParams } from "@/store/map";
import type { StoryDatasetsItem } from "@/types/generated/strapi.schemas";

type RelatedDatasetsProps = {
  datasets: StoryDatasetsItem[];
};

const buildDatasetHref = (searchParams: string, slug: string) => {
  const params = new URLSearchParams(searchParams);
  params.set("datasets", slug);
  return `/map?${params.toString()}`;
};

const RelatedDatasets = ({ datasets }: RelatedDatasetsProps) => {
  const t = useTranslations();
  const searchParams = useSyncSearchParams();

  const linkableDatasets = datasets.filter(
    (d): d is StoryDatasetsItem & { slug: string } => !!d.slug,
  );

  if (linkableDatasets.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide">{t("Related datasets")}</h2>
      <ul className="space-y-2">
        {linkableDatasets.map((d) => (
          <li key={d.id}>
            <Link
              href={buildDatasetHref(searchParams, d.slug)}
              className="block rounded-lg bg-green-medium px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-light"
            >
              {d.title ?? d.slug}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedDatasets;
