import Image from "next/image";

import eoAfricaLogo from "@/assets/images/partner-pages/eo-africa-logo.png";
import EsaLogo from "@/svgs/partner-pages/esa-logo.svg";
import { useTranslations } from "@/i18n";
import BodyLink from "./body-link";
import RamonaProductsTable from "./ramona-products-table";

const RamonaBody = () => {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2.5 text-base leading-7">
      <div className="space-y-4">
        <p>
          RAMONA (Rangeland Monitoring for Africa using Earth Observation) is a continental-scale
          rangeland monitoring system for Africa, developed under the European Space Agency&apos;s
          EO AFRICA framework. It delivers a suite of high-resolution products describing where
          African rangelands are, what ecosystem type they are, how productive they are, and how
          their productivity varies through the growing season. Products are derived from the
          Copernicus Sentinel constellation using open-source algorithms, and are calibrated and
          validated against in-situ measurements from Senegal, Sudan, Kenya and South Africa.
        </p>
        <p>
          RAMONA was executed by a science-industry consortium led by Aarhus University (Denmark),
          with Lund University (Sweden), DHI GRAS (Denmark) and GeoVille (Austria), under ESA
          Contract 4000136180/21/I-NB. The demonstrator was completed in July 2026.
        </p>
      </div>
      <p className="font-medium">Product overviewAccess to the data</p>
      <RamonaProductsTable />
      <div className="space-y-4">
        <p>
          The RAMONA product suite is served from the ESA Payload Data Ground Segment Product
          Results Repository (PRR) as STAC-compliant collections in Cloud-Optimised GeoTIFF format.
        </p>
        <p>
          A general description of the PRR archive is available at{" "}
          <BodyLink href="https://eoresults.esa.int/prr_faq.html">
            https://eoresults.esa.int/prr_faq.html
          </BodyLink>
          .
        </p>
      </div>
      <div className="space-y-4">
        <p className="font-medium">On-demand mosaicking</p>
        <p>
          For user-defined country-level Herbaceous Rangeland Biomass mosaics, RAMONA provides an
          on-demand processing utility through the ESA APEx algorithm catalogue:{" "}
          <BodyLink href="https://algorithm-catalogue.apex.esa.int/apps/RAMONA-herbaceous_rangeland_biomass-country-mosaick">
            https://algorithm-catalogue.apex.esa.int/apps/RAMONA-herbaceous_rangeland_biomass-country-mosaick
          </BodyLink>
          .
        </p>
        <p className="font-medium">A note on the rangeland definition</p>
        <p>
          RAMONA defines rangeland inclusively: all vegetated land that is not cropland or
          closed-canopy forest. This definition is based on land cover rather than land use, because
          land-use categories (such as &quot;pastoral land&quot; or &quot;productive
          rangeland&quot;) reflect management and human activity that cannot be measured directly
          from satellite data. The RAMONA definition is the most inclusive of those currently in
          operational use, which means users with narrower interests — for example, in productive
          pastoral land only — can apply additional masks to restrict the RAMONA products to their
          area of interest.
        </p>
        <p className="font-medium">Limitations</p>
        <p>Users should be aware of three limitations of the demonstrator products.</p>
        <ul className="list-disc ps-6">
          <li>
            <span className="font-medium">Temporal scope.</span> Products cover the period August
            2021 to January 2023. Multi-year climatologies and trend analyses are not directly
            available from RAMONA alone; the Herbaceous Biomass Anomalies product uses the
            Copernicus Dry Matter Productivity (DMP) product as its baseline. Extension of the
            RAMONA archive to multi-year coverage is a priority for future work.
          </li>
          <li>
            <span className="font-medium">Geographic scope.</span> Continental Africa. Some areas of
            high productivity in central Africa and low productivity in the Sahara were not
            processed in the demonstrator; these were assumed to be closed-canopy forest and
            unvegetated desert and are shown as gaps in the products.
          </li>
          <li>
            <span className="font-medium">Third-party inputs.</span> The Rangeland Extent and
            Rangeland Type products rely on ESA WorldCover (2021) for cropland and built-up masking,
            and on the Meta/WRI global canopy height map (2017–2020) for closed-forest exclusion and
            structural characterisation. These inputs are static and will not reflect recent
            land-cover or canopy change until they are updated or replaced.
          </li>
        </ul>
        <p className="font-medium">Documentation</p>
        <ul className="list-disc ps-6">
          <li>Algorithm Theoretical Basis Document and Validation Report (D6/D11).</li>
        </ul>
      </div>
      <div className="flex items-center gap-[50.731px] p-4">
        <Image
          src={eoAfricaLogo}
          alt={t("EO AFRICA logo")}
          className="h-[70px] w-[70px] shrink-0 object-cover"
        />
        <EsaLogo role="img" aria-label={t("European Space Agency logo")} className="shrink-0" />
      </div>
    </div>
  );
};

export default RamonaBody;
