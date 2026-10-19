import type { GetFeaturesParams } from "@/types/generated/strapi.schemas";

export function getFeatureDetailParams(slug: string): GetFeaturesParams {
  return {
    filters: { slug: { $eq: slug } },
    populate: ["image", "document", "translations", "further_information"],
    "pagination[limit]": 1,
  };
}
