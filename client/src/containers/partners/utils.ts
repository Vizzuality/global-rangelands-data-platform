export function getPartner<T extends { slug: string }>(
  partners: readonly T[],
  slug: string,
): T | undefined {
  return partners.find((partner) => partner.slug === slug);
}

export function getOtherPartners<T extends { slug: string }>(
  partners: readonly T[],
  slug: string,
): T[] {
  return partners.filter((partner) => partner.slug !== slug);
}
