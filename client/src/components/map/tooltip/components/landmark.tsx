"use strict";

import { useTranslations } from "@/i18n";
import { MapTooltipProps } from "../../types";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { landmarkActiveFidAtom, landmarkCandidatesAtom } from "@/store/map";

const FORM_REC_KEY: Record<string, string> = {
  "Acknowledged by govt": "Acknowledged by government",
  "Not acknowledged by govt": "Not acknowledged by government",
};

type LandmarkProperties = {
  name?: string;
  country?: string;
  identity?: string;
  layer?: string;
  form_rec?: string;
  doc_status?: string;
  category?: string;
  data_src_s?: string;
  data_date?: string;
  gfw_geostore_id?: string;
};

const normalize = (raw: Record<string, unknown> | undefined): LandmarkProperties => {
  const r = (raw || {}) as Record<string, unknown>;
  return {
    name: r.name as string,
    country: r.country as string,
    identity: r.identity as string,
    layer: r.layer as string,
    form_rec: (r.form_rec ?? r.formRec) as string,
    doc_status: (r.doc_status ?? r.docStatus) as string,
    category: (r.category ?? r.landCategory) as string,
    data_src_s: (r.data_src_s ?? r.source) as string,
    data_date: (r.data_date ?? r.dataDate) as string,
    gfw_geostore_id: r.gfw_geostore_id as string,
  };
};

const LandmarkDetail = ({
  properties,
  onBack,
}: {
  properties: LandmarkProperties;
  onBack?: () => void;
}) => {
  const t = useTranslations();
  const { name, country, identity, form_rec, doc_status, category, data_src_s, data_date } =
    properties;
  const identityLabel = identity ? `${t(identity)} ${t("land")}` : undefined;
  const formRecLabel = form_rec ? t(FORM_REC_KEY[form_rec] || form_rec) : undefined;
  const docStatusLabel = doc_status ? t(doc_status) : undefined;
  const sourceLabel = data_src_s && data_date ? `${data_src_s}, ${data_date}` : data_src_s;

  return (
    <>
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-auto p-0 text-xs font-semibold"
        >
          <ChevronLeftIcon className="mr-1 h-4 w-4" />
          {t("Back to list")}
        </Button>
      )}
      <div className="space-y-2">
        <h2 className="text-base font-bold leading-tight">{name}</h2>
        {country && <p className="text-xs leading-tight">{country}</p>}
      </div>
      <dl className="space-y-3">
        {identityLabel && (
          <div className="space-y-2">
            <dt className="font-semibold">{t("Identity")}</dt>
            <dd>{identityLabel}</dd>
          </div>
        )}
        {formRecLabel && (
          <div className="space-y-2">
            <dt className="font-semibold">{t("Government recognition")}</dt>
            <dd>{formRecLabel}</dd>
          </div>
        )}
        {docStatusLabel && (
          <div className="space-y-2">
            <dt className="font-semibold">{t("Documentation status")}</dt>
            <dd>{docStatusLabel}</dd>
          </div>
        )}
        {category && (
          <div className="space-y-2">
            <dt className="font-semibold">{t("Land category")}</dt>
            <dd>{category}</dd>
          </div>
        )}
        {sourceLabel && (
          <div className="space-y-2">
            <dt className="font-semibold">{t("Source")}</dt>
            <dd>{sourceLabel}</dd>
          </div>
        )}
      </dl>
    </>
  );
};

const LandmarkList = ({
  candidates,
  onSelect,
}: {
  candidates: LandmarkProperties[];
  onSelect: (fid: string) => void;
}) => {
  const t = useTranslations();
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-base font-bold leading-tight">{t("Select which data to view")}</h2>
        <p className="text-xs leading-tight">
          {t("The area you selected returned several results, select an item below to learn more.")}
        </p>
      </div>
      <ul className="divide-y divide-neutral-200">
        {candidates.map((c) => (
          <li key={c.gfw_geostore_id}>
            <button
              type="button"
              onClick={() => c.gfw_geostore_id && onSelect(c.gfw_geostore_id)}
              className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm hover:opacity-80"
            >
              <span className="flex-1">
                <span className="font-semibold underline">{c.name}</span>{" "}
                {c.layer && <span className="text-muted-foreground">{t(c.layer)}</span>}
              </span>
              <ChevronRightIcon className="h-4 w-4 shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

const LandmarkTooltip = (props: MapTooltipProps) => {
  const t = useTranslations();
  const candidates = useAtomValue(landmarkCandidatesAtom);
  const activeFid = useAtomValue(landmarkActiveFidAtom);
  const setActiveFid = useSetAtom(landmarkActiveFidAtom);

  const normalizedCandidates = candidates.map((c) => normalize(c.properties));
  const hasMultiple = normalizedCandidates.length > 1;

  if (hasMultiple && !activeFid) {
    return (
      <div className="w-[308px] overflow-hidden bg-background drop-shadow-2xl">
        <div className="border-t-[12px] border-t-foreground"></div>
        <div className="space-y-3 p-6 pt-3">
          <LandmarkList candidates={normalizedCandidates} onSelect={setActiveFid} />
        </div>
      </div>
    );
  }

  const stepProperties = hasMultiple
    ? normalizedCandidates.find((c) => c.gfw_geostore_id === activeFid) ?? normalizedCandidates[0]
    : normalize(props as Record<string, unknown>);

  return (
    <div className="w-[308px] overflow-hidden bg-background drop-shadow-2xl">
      <div className="border-t-[12px] border-t-foreground"></div>
      <div className="space-y-3 p-6 pt-3">
        <LandmarkDetail
          properties={stepProperties}
          onBack={hasMultiple ? () => setActiveFid(null) : undefined}
        />
        <div className="text-xs leading-normal">
          {t(
            "Note: The presented information is a subset of the content available in the original source ",
          )}{" "}
          (
          <a
            href="https://landmarkmap.org/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            LandMark
          </a>
          ).
        </div>
      </div>
    </div>
  );
};

export default LandmarkTooltip;
