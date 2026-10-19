import Image from "next/image";

import gpwLogoLockup from "@/assets/images/partner-pages/gpw-logo-lockup.png";
import { useTranslations } from "@/i18n";
import BodyLink from "./body-link";

const GlobalPastureWatchBody = () => {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-4 text-base leading-7">
        <p>
          The{" "}
          <BodyLink href="https://landcarbonlab.org/about-global-pasture-watch/">
            Global Pasture Watch research consortium
          </BodyLink>{" "}
          works to improve global monitoring of grasslands, grazing lands and livestock systems by
          producing open,{" "}
          <BodyLink href="https://landcarbonlab.org/data/global-grassland-and-livestock-monitoring/">
            regularly updated geospatial datasets
          </BodyLink>
          . The data and research help governments, civil society, practitioners and academics
          understand the extent, condition and use of grassland and rangeland areas, informing
          restoration planning, supply chain due diligence, climate and biodiversity assessments,
          and national reporting.
        </p>
        <p>
          Current Global Pasture Watch products include the following global annual products from
          year 2000 to current.
        </p>
        <ul className="list-disc ps-6">
          <li>
            <BodyLink href="https://landcarbonlab.org/insights/first-global-annual-cultivated-natural-grassland-data">
              Grassland extent
            </BodyLink>{" "}
            in 2 classes: cultivated (e.g. plated pastures) and natural/semi-natural grasslands, 30
            m s, 30-m.
          </li>
          <li>
            <BodyLink href="https://landcarbonlab.org/insights/global-short-vegetation-height-outside-forest">
              Short vegetation height
            </BodyLink>
            , 30 m
          </li>
          <li>
            <BodyLink href="https://landcarbonlab.org/insights/global-productivity-data-ecosystem-health">
              Grassland productivity
            </BodyLink>
            , 30 m
          </li>
          <li>
            <BodyLink href="https://landcarbonlab.org/insights/global-livestock-dynamics/">
              Livestock distribution
            </BodyLink>{" "}
            for cattle, sheep, goats, horses, and buffaloes, 1 km
          </li>
        </ul>
        <p>
          The consortium is led by Land &amp; Carbon Lab, convened by the Bezos Earth Fund and World
          Resources Institute (WRI), and brings together experts in geospatial monitoring, machine
          learning, ecology and agriculture from{" "}
          <BodyLink href="https://opengeohub.org/">OpenGeoHub</BodyLink>,{" "}
          <BodyLink href="http://www.lapig.iesa.ufg.br/">LAPIG/UFG</BodyLink>,{" "}
          <BodyLink href="https://iiasa.ac.at/">IIASA</BodyLink>, the{" "}
          <BodyLink href="https://www.idiv.de/">
            German Centre for Integrative Biodiversity Research (iDiv),
          </BodyLink>{" "}
          <BodyLink href="https://cals.cornell.edu/global-development">
            Cornell University&apos;s CALS Department of Global Development
          </BodyLink>
          , and the{" "}
          <BodyLink href="https://glad.umd.edu/">University of Maryland GLAD lab</BodyLink>.
        </p>
        <p>
          Linked technical blogs cover data production, limitations and example applications — from
          land degradation monitoring and restoration planning to biodiversity, carbon and
          livestock-sector assessments. Technical questions about the data can be directed to the{" "}
          <BodyLink href="https://github.com/wri/global-pasture-watch/discussions">
            GitHub discussion board
          </BodyLink>
          .
        </p>
      </div>
      <Image
        src={gpwLogoLockup}
        alt={t("Global Pasture Watch partner logos")}
        sizes="632px"
        className="h-auto w-full"
      />
    </div>
  );
};

export default GlobalPastureWatchBody;
