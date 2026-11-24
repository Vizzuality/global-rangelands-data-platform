import type { ReactNode } from "react";
import Image from "next/image";

import processingFlow from "@/assets/images/partner-pages/ramona-processing-flow.jpg";
import rangelandExtentMap from "@/assets/images/partner-pages/ramona-rangeland-extent-map.jpg";
import rangelandTypeMap from "@/assets/images/partner-pages/ramona-rangeland-type-map.jpg";
import ramonaLogoFooter from "@/assets/images/partner-pages/ramona-logo-footer.png";
import sentinelSynergy from "@/assets/images/partner-pages/ramona-sentinel-synergy.jpg";
import timesatPhenology from "@/assets/images/partner-pages/ramona-timesat-phenology.png";
import ArrowUpRight from "@/svgs/partner-pages/arrow-up-right.svg";
import ArrowUpRightBrand from "@/svgs/partner-pages/arrow-up-right-brand.svg";
import EsaLogo from "@/svgs/partner-pages/esa-logo.svg";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import BodyLink from "./body-link";
import ExpandableFigure from "./expandable-figure";
import RamonaProductsTable from "./ramona-products-table";

const STAC_COLLECTIONS_URL =
  "https://eoresults.esa.int/browser/#/external/eoresults.esa.int/stac/collections";

const STATS = [
  { value: "10 m", label: "Native product resolution" },
  { value: "2,258", label: "Sentinel-2 tiles processed" },
  { value: "18 months", label: "of monthly biomass, Aug 2021 – Jan 2023" },
  { value: "4 countries", label: "of in-situ validation" },
];

const APPLICATIONS = [
  {
    title: "Food security early warning",
    text: "Continental rangeland extent and productivity as input to global early warning systems, including evaluation by the JRC ASAP team as an alternative rangeland mask.",
  },
  {
    title: "Protected-area management",
    text: "Herbaceous biomass anomalies as a landscape-scale warning signal for grazing pressure, vegetation change and drought impacts in national parks and conservation areas.",
  },
  {
    title: "Index-based livestock insurance",
    text: "10 m herbaceous biomass with woody/herbaceous partitioning as a next-generation input to IBLI schemes that better represents forage availability for grazers.",
  },
  {
    title: "National rangeland monitoring and SDG reporting",
    text: "Spatially explicit biomass and phenology products to complement national field campaigns and support reporting under UNCCD and SDG 15.3.1.",
  },
  {
    title: "Long-term ecological research",
    text: "Landscape-scale extrapolation of point-based ground monitoring across environmental and management gradients.",
  },
  {
    title: "Restoration investment and planning",
    text: "A consistent continental baseline of rangeland extent, type and productivity to support restoration prioritisation and impact monitoring.",
  },
];

const DATA_COLLECTIONS = [
  { label: "Rangelands Extent", href: `${STAC_COLLECTIONS_URL}/ramona_re?.language=en` },
  { label: "Rangelands Type", href: `${STAC_COLLECTIONS_URL}/ramona_rt?.language=en` },
  {
    label: "Herbaceous Rangeland Biomass",
    href: `${STAC_COLLECTIONS_URL}/ramona_hrb?.language=en`,
  },
  { label: "HRB Mosaics", href: `${STAC_COLLECTIONS_URL}/ramona_hrb_mosaic?.language=en` },
  {
    label: "Rangeland Phenology Paremeters",
    href: `${STAC_COLLECTIONS_URL}/ramona_rpp?.language=en`,
  },
];

const LIMITATIONS = [
  "Temporal scope. Products cover the period August 2021 to January 2023. Multi-year climatologies and trend analyses are not directly available from RAMONA alone; the Herbaceous Biomass Anomalies product uses the Copernicus Dry Matter Productivity (DMP) product as its baseline. Extension of the RAMONA archive to multi-year coverage is a priority for future work.",
  "Geographic scope. Continental Africa. Some areas of high productivity in central Africa and of low productivity in the Sahara were not processed in the demonstrator; these were assumed to be closed-canopy forest and unvegetated desert respectively, and appear as gaps in the products.",
  "Third-party inputs. The Rangeland Extent and Rangeland Type products rely on ESA WorldCover (2021) for cropland and built-up masking, and on the Meta/WRI global canopy height map (2017–2020) for closed-forest exclusion and structural characterisation. These inputs are static and will not reflect recent land-cover or canopy change until they are updated or replaced.",
];

const CONTACTS = [
  { name: "Robert Buitenwerf", organisation: "Aarhus University", email: "buitenwerf@bio.au.dk" },
  { name: "Michael Munk", organisation: "DHI", email: "mimu@dhigroup.com" },
  {
    name: "Patrick Griffiths",
    organisation: "European Space Agency",
    email: "Patrick.Griffiths@esa.int",
  },
];

const CONSORTIUM = [
  { name: "Aarhus University", href: "https://bio.au.dk/forskning/forskningscentre/econovo" },
  { name: "Lund University", href: "https://www.nateko.lu.se/" },
  { name: "DHI", href: "https://eo.dhigroup.com/" },
  { name: "GeoVille", href: "https://www.geoville.com/" },
];

const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h2 className="font-serif text-2xl font-normal leading-10">{children}</h2>
);

const Caption = ({ children, className }: { children: ReactNode; className?: string }) => (
  <figcaption className={cn("text-xs font-light leading-4", className)}>{children}</figcaption>
);

const RamonaBody = () => {
  const t = useTranslations();
  const expandLabel = t("Expand figure");
  const collapseLabel = t("Collapse figure");

  return (
    <div className="flex flex-col gap-10 pt-6 text-base leading-7">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <SectionHeading>What RAMONA offers</SectionHeading>
            <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
              <div className="flex flex-col gap-4 lg:w-[412px]">
                <p>
                  RAMONA is a continental-scale rangeland monitoring system for Africa, developed
                  under the European Space Agency&apos;s EO AFRICA framework. It delivers a suite of
                  high-resolution products describing{" "}
                  <span className="font-semibold">
                    where African rangelands are, what ecosystem type they are, how productive they
                    are, and how their productivity varies through the growing season.
                  </span>
                </p>
                <p>
                  Products are derived from the Copernicus Sentinel constellation using open-source
                  algorithms, and are calibrated and validated against in-situ measurements from
                  Senegal, Sudan, Kenya and South Africa. They are designed to support decisions
                  across the rangeland management hierarchy — from continental early warning to
                  national reporting to protected-area management.
                </p>
              </div>
              <figure className="flex flex-col gap-2 lg:w-[332px] lg:shrink-0">
                <Image
                  src={rangelandTypeMap}
                  alt={t("RAMONA rangeland type classification, continental Africa")}
                  sizes="(min-width: 1024px) 332px, 100vw"
                  className="aspect-[332/354] h-auto w-full object-cover"
                />
                <Caption>
                  RAMONA rangeland type classification, continental Africa. Colours represent 36
                  functional types differing in productivity, seasonality and vegetation structure.
                </Caption>
              </figure>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.value}
                className="flex flex-col-reverse justify-end gap-1 border-b-2 border-brown-dark pb-4 pr-4"
              >
                <dt className="text-xs leading-4">{stat.label}</dt>
                <dd className="font-medium leading-6 text-brown-dark">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Product suite</SectionHeading>
          <RamonaProductsTable />
          <figure className="flex flex-col gap-4 pb-4">
            <div className="lg:px-[60px]">
              <Image
                src={timesatPhenology}
                alt={t(
                  "TIMESAT-derived phenology and productivity parameters based on GPP data for a Sentinel-2 pixel",
                )}
                sizes="(min-width: 1024px) 696px, 100vw"
                className="aspect-[605/248] h-auto w-full object-cover object-left"
              />
            </div>
            <Caption className="lg:px-[100px]">
              TIMESAT-derived phenology and productivity parameters based on GPP data for a
              Sentinel-2 pixel: (a, b) start of season date and value, (c, d) end of season date and
              value, (e, f) maximum date and value, (h) seasonal productivity, (h + i) total
              productivity.
            </Caption>
          </figure>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>How the products are made</SectionHeading>
          <p>
            RAMONA products are generated by a modular processing chain that combines Sentinel-1,
            Sentinel-2 and Sentinel-3 observations with ancillary data. Data fusion and TIMESAT
            smoothing produce gap-free 10 m vegetation time series, which feed the core and
            experimental products.
          </p>
          <figure className="flex flex-col-reverse gap-2 pt-5 lg:flex-row lg:justify-between lg:gap-8">
            <Caption className="lg:w-[274px]">
              RAMONA processing flow and product interdependencies. Core, experimental and
              intermediate products are colour-coded; input data are shown in blue.
            </Caption>
            <ExpandableFigure
              src={processingFlow}
              alt={t(
                "RAMONA processing flow and product interdependencies, from Sentinel inputs through data fusion and TIMESAT smoothing to core, experimental and intermediate products",
              )}
              expandLabel={expandLabel}
              collapseLabel={collapseLabel}
              sizes="(min-width: 1024px) 462px, 100vw"
              className="w-full overflow-hidden rounded-[22px] lg:w-[462px] lg:shrink-0"
              expandedClassName="rounded-[30px]"
            />
          </figure>
          <figure className="flex flex-col-reverse gap-2 pt-5 lg:flex-row lg:justify-between lg:gap-8">
            <Caption className="lg:w-[274px]">
              Sentinel synergy: complementary temporal, spatial and radiometric resolution of the
              Sentinel-1, -2 and -3 missions used by RAMONA.
            </Caption>
            <ExpandableFigure
              src={sentinelSynergy}
              alt={t(
                "Sentinel-1, Sentinel-2 and Sentinel-3 mission timelines, sensor characteristics and spectral bands",
              )}
              expandLabel={expandLabel}
              collapseLabel={collapseLabel}
              sizes="(min-width: 1024px) 438px, 100vw"
              className="w-full rounded-[22px] border-2 border-teal-dark p-2.5 lg:w-[462px] lg:shrink-0"
              expandedClassName="rounded-[30px] border-2 border-teal-dark bg-white p-2.5"
            />
          </figure>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <SectionHeading>Applications</SectionHeading>
            <p>
              RAMONA products have been designed for, and are being explored by, users across a
              range of operational and scientific settings.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
            {APPLICATIONS.map((application) => (
              <div
                key={application.title}
                className="flex flex-col gap-1.5 border-b-2 border-brown-dark pb-4 text-sm"
              >
                <h3 className="font-medium leading-7">{application.title}</h3>
                <p className="leading-[26px]">{application.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <SectionHeading>Access the data</SectionHeading>
            <p>
              The full RAMONA product suite is served from the{" "}
              <BodyLink href="https://eoresults.esa.int/prr_faq.html">
                ESA Project Results Repository (PRR)
              </BodyLink>{" "}
              as STAC-compliant collections in Cloud-Optimised GeoTIFF format.
            </p>
            <ul className="flex flex-col gap-2.5 text-sm leading-6">
              {DATA_COLLECTIONS.map((collection) => (
                <li key={collection.label} className="flex items-center gap-2">
                  <ArrowUpRight aria-hidden className="shrink-0" />
                  <BodyLink href={collection.href}>{collection.label}</BodyLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-medium leading-6">Generate custom mosaics on demand</h3>
            <p>
              Pre-computed Herbaceous Rangeland Biomass mosaics are available in the HRB Mosaics
              collection above. For user-defined country-level mosaics, RAMONA also provides an
              on-demand processing utility through the ESA APEx algorithm catalogue.
            </p>
            <p className="flex items-center gap-2 font-medium text-brown-dark">
              <ArrowUpRightBrand aria-hidden className="shrink-0" />
              <BodyLink href="https://algorithm-catalogue.apex.esa.int/apps/RAMONA-herbaceous_rangeland_biomass-country-mosaick">
                Open the on-demand mosaicking tool
              </BodyLink>
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>A note on the rangeland definition</SectionHeading>
          <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
            <div className="lg:w-[404px]">
              <p>
                RAMONA defines rangeland inclusively:{" "}
                <span className="font-medium">
                  all vegetated land that is not cropland or closed-canopy forest
                </span>
                . This definition is based on land cover rather than land use, because land-use
                categories (such as &quot;pastoral land&quot; or &quot;productive rangeland&quot;)
                reflect management and human activity that cannot be measured directly from
                satellite data.
              </p>
              <p>
                The RAMONA definition is the most inclusive of those currently in operational use,
                which means users with narrower interests — for example, in productive pastoral land
                only — can apply additional masks to restrict the RAMONA products to their area of
                interest.
              </p>
            </div>
            <figure className="flex flex-col gap-2 lg:w-[332px] lg:shrink-0">
              <Image
                src={rangelandExtentMap}
                alt={t("RAMONA 10 m rangeland extent for continental Africa")}
                sizes="(min-width: 1024px) 332px, 100vw"
                className="h-auto w-full"
              />
              <Caption>
                RAMONA 10 m rangeland extent for continental Africa. Green: mapped rangeland. Grey:
                cropland, closed-canopy forest, water and unvegetated areas.
              </Caption>
            </figure>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Limitations to be aware of</SectionHeading>
          <ul className="flex list-disc flex-col gap-4 ps-6">
            {LIMITATIONS.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeading>Documentation</SectionHeading>
          <p>Algorithm Theoretical Basis Document and Validation Report (D6/D11)</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-medium leading-6">Contact</h2>
          <ul className="grid grid-cols-1 gap-6 text-xs leading-4 lg:grid-cols-3">
            {CONTACTS.map((contact) => (
              <li
                key={contact.email}
                className="flex flex-col gap-1 border-b-2 border-brown-dark pb-4"
              >
                <span className="font-medium">{contact.name}</span>
                <span className="font-light">{contact.organisation}</span>
                <a href={`mailto:${contact.email}`} className="transition-opacity hover:opacity-80">
                  {contact.email}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-xs font-light leading-4">
          RAMONA — ESA Contract 4000136180/21/I-NB
          <br />
          {CONSORTIUM.map((member, index) => (
            <span key={member.name}>
              {index > 0 && " · "}
              <BodyLink href={member.href}>{member.name}</BodyLink>
            </span>
          ))}
        </p>
        <div className="flex items-center gap-8">
          <Image
            src={ramonaLogoFooter}
            alt={t("RAMONA — Rangeland Monitoring for Africa using Earth Observation logo")}
            sizes="107px"
            className="h-14 w-auto"
          />
          <EsaLogo role="img" aria-label={t("European Space Agency logo")} className="shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default RamonaBody;
