"use client";
import RichText from "@/components/ui/rich-text";
import { useTranslations } from "@/i18n";
import { DefaultCitationsComponent } from "@/types/generated/strapi.schemas";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";

import { DialogProps } from "@radix-ui/react-dialog";
import { ArrowRightIcon } from "lucide-react";

type DatsetInfoProps = DialogProps & {
  info?: string;
  citations?: DefaultCitationsComponent[];
  title?: string;
};

const DatasetInfo = ({ citations, info, title, ...props }: DatsetInfoProps) => {
  const t = useTranslations();
  return (
    <Dialog {...props}>
      <DialogTrigger
        disabled={!info}
        className="flex h-min gap-1 text-xs font-medium uppercase text-foreground underline underline-offset-2"
      >
        {t("Learn more")} <ArrowRightIcon className="h-4 w-4 -rotate-45 stroke-foreground" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="font-medium">{title}</DialogHeader>
        <div className="text-sm">
          <div className="space-y-4">
            <div>
              <RichText>{info}</RichText>
            </div>
            {!!citations?.length && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("Dataset reference")}</p>
                {citations.map((citation) => (
                  <div className="text-xs" key={citation.id}>
                    <p>{citation?.name}</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatasetInfo;
