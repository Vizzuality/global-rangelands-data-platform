import TableLinkArrow from "@/svgs/partner-pages/table-link-arrow.svg";
import BodyLink from "./body-link";

type RamonaProduct = {
  name: string;
  href?: string;
  resolution: string;
  frequency: string;
  coverage: string;
};

const STAC_COLLECTIONS_URL =
  "https://eoresults.esa.int/browser/#/external/eoresults.esa.int/stac/collections";

const RAMONA_PRODUCTS: RamonaProduct[] = [
  {
    name: "Rangeland Extent",
    href: `${STAC_COLLECTIONS_URL}/ramona_re?.language=en`,
    resolution: "10 m",
    frequency: "Annual",
    coverage: "Continental Africa, 2022",
  },
  {
    name: "Rangeland Type",
    href: `${STAC_COLLECTIONS_URL}/ramona_rt?.language=en`,
    resolution: "10 m",
    frequency: "Annual",
    coverage: "Continental Africa, 2022",
  },
  {
    name: "Herbaceous Rangeland Biomass (HRB)",
    href: `${STAC_COLLECTIONS_URL}/ramona_hrb?.language=en`,
    resolution: "10 m",
    frequency: "Monthly",
    coverage: "Continental Africa, Aug 2021 – Jan 2023",
  },
  {
    name: "HRB country-level mosaics",
    href: `${STAC_COLLECTIONS_URL}/ramona_hrb_mosaic?.language=en`,
    resolution: "10 m",
    frequency: "Monthly",
    coverage: "Africa, on demand via APEx",
  },
  {
    name: "Herbaceous Biomass Anomalies",
    resolution: "300 m",
    frequency: "Seasonal",
    coverage: "Continental Africa, 2022",
  },
  {
    name: "Rangeland Phenology parameters",
    href: `${STAC_COLLECTIONS_URL}/ramona_rpp?.language=en`,
    resolution: "10 m",
    frequency: "Annual",
    coverage: "Continental Africa, 2022",
  },
];

const RamonaProductsTable = () => (
  <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="RAMONA product overview">
    <table className="w-full min-w-[632px] table-fixed border-collapse text-sm font-normal">
      <colgroup>
        <col className="w-[164px]" />
        <col className="w-[54px]" />
        <col className="w-[84px]" />
        <col className="w-[84px]" />
        <col />
      </colgroup>
      <thead>
        <tr className="text-left font-medium leading-7">
          <th colSpan={2} scope="col" className="pb-2.5 font-medium">
            Product
          </th>
          <th scope="col" className="pb-2.5 font-medium">
            Resolution
          </th>
          <th scope="col" className="pb-2.5 font-medium">
            Frequency
          </th>
          <th scope="col" className="pb-2.5 font-medium">
            Coverage
          </th>
        </tr>
      </thead>
      <tbody className="align-top leading-[22px]">
        {RAMONA_PRODUCTS.map((product) => (
          <tr key={product.name}>
            <td className="pb-2 pr-[14px]">
              <BodyLink href={product.href}>{product.name}</BodyLink>
            </td>
            <td className="pb-2 pr-[14px]">
              {product.href && <TableLinkArrow aria-hidden className="h-5 w-10" />}
            </td>
            <td className="pb-2 pr-[14px]">{product.resolution}</td>
            <td className="pb-2 pr-[14px]">{product.frequency}</td>
            <td className="pb-2">{product.coverage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RamonaProductsTable;
