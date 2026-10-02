import { CirclePlay, ExternalLink, FileText } from "lucide-react";

import { DEFAULT_LOCALE } from "@/i18n/routing";
import type { DefaultFurtherInfoComponent } from "@/types/generated/strapi.schemas";

type FurtherInfoItemProps = {
  item: DefaultFurtherInfoComponent;
  locale: string;
};

const FurtherInfoItem = ({ item, locale }: FurtherInfoItemProps) => {
  const content =
    locale !== DEFAULT_LOCALE
      ? (item[`content_${locale}` as keyof DefaultFurtherInfoComponent] as string | undefined) ??
        item.content
      : item.content;

  const safeUrl = /^(https?:|mailto:)/i.test((item.url ?? "").trim()) ? item.url : undefined;

  const icon =
    item.type === "video" ? (
      <CirclePlay className="h-4 w-4 shrink-0" />
    ) : item.type === "paper" ? (
      <FileText className="h-4 w-4 shrink-0" />
    ) : (
      <ExternalLink className="h-4 w-4 shrink-0" />
    );

  const inner = (
    <>
      <span className="mt-0.5">{icon}</span>
      <span>{content ?? item.url}</span>
    </>
  );

  if (safeUrl) {
    return (
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2 text-sm underline underline-offset-2 hover:text-green-light"
      >
        {inner}
      </a>
    );
  }

  return <span className="flex items-start gap-2 text-sm">{inner}</span>;
};

export default FurtherInfoItem;
