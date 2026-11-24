type RamonaProduct = {
  name: string;
  resolution: string;
  frequency: string;
  coverage: string;
};

const RAMONA_PRODUCTS: RamonaProduct[] = [
  {
    name: "Rangeland Extent",
    resolution: "10 m",
    frequency: "Annual",
    coverage: "Continental Africa, 2022",
  },
  {
    name: "Rangeland Type",
    resolution: "10 m",
    frequency: "Annual",
    coverage: "Continental Africa, 2022",
  },
  {
    name: "Herbaceous Rangeland Biomass (HRB)",
    resolution: "10 m",
    frequency: "Monthly",
    coverage: "Continental Africa, Aug 2021 – Jan 2023",
  },
  {
    name: "HRB country-level mosaics",
    resolution: "10 m",
    frequency: "Monthly",
    coverage: "Africa; pre-computed in the PRR and custom on demand via APEx",
  },
  {
    name: "Herbaceous Biomass Anomalies",
    resolution: "300 m",
    frequency: "Seasonal",
    coverage: "Continental Africa, 2022",
  },
  {
    name: "Rangeland Phenology parameters",
    resolution: "10 m",
    frequency: "Annual",
    coverage: "Continental Africa, 2022",
  },
];

const RamonaProductsTable = () => (
  <div
    className="overflow-x-auto pb-4"
    tabIndex={0}
    role="region"
    aria-label="RAMONA product suite"
  >
    <table className="w-full min-w-[560px] table-fixed border-collapse text-xs leading-4">
      <colgroup>
        <col className="w-[193px]" />
        <col className="w-[99px]" />
        <col className="w-[98.5px]" />
        <col />
      </colgroup>
      <thead>
        <tr className="text-left">
          <th scope="col" className="pb-2 pr-8 font-medium">
            Product
          </th>
          <th scope="col" className="pb-2 pr-8 font-medium">
            Resolution
          </th>
          <th scope="col" className="pb-2 pr-8 font-medium">
            Frequency
          </th>
          <th scope="col" className="pb-2 font-medium">
            Coverage
          </th>
        </tr>
      </thead>
      <tbody className="align-top">
        {RAMONA_PRODUCTS.map((product) => (
          <tr key={product.name} className="border-b border-orange-pale">
            <td className="py-2 pr-8">{product.name}</td>
            <td className="py-2 pr-8">{product.resolution}</td>
            <td className="py-2 pr-8">{product.frequency}</td>
            <td className="py-2">{product.coverage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RamonaProductsTable;
