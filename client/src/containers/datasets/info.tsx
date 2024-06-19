"use client";
import RichText from "@/components/ui/rich-text";
import { useTranslations } from "@/i18n";
import { DefaultCitationsComponent } from "@/types/generated/strapi.schemas";

type DatsetInfoProps = {
  info?: string;
  citations?: DefaultCitationsComponent[];
};

const DatasetInfo = ({ citations, info }: DatsetInfoProps) => {
  const t = useTranslations();
  return (
    <div className="space-y-4">
      <div>
        <RichText>{info}</RichText>
      </div>
      {!!citations?.length && (
        <div className="space-y-2 text-sm">
          <h3 className="font-medium">{t("Dataset reference")}</h3>
          {citations.map((citation) => (
            <div className="text-xs" key={citation.id}>
              <h4>{citation?.name}</h4>
              <a
                href={citation?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {citation?.url}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatasetInfo;
