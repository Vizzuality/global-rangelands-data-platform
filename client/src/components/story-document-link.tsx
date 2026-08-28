import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import DocumentIcon from "@/svgs/document.svg";
import type { StoryDocument } from "@/types/generated/strapi.schemas";

type StoryDocumentLinkProps = {
  document: StoryDocument | undefined;
  slug: string;
  variant: "panel" | "page";
};

const getBorderClassName = (variant: StoryDocumentLinkProps["variant"]) =>
  variant === "panel" ? "border-[3px]" : "border";

const StoryDocumentLink = ({ document, slug, variant }: StoryDocumentLinkProps) => {
  const t = useTranslations();

  if (!document?.url) return null;

  const title = document.caption ?? document.name;

  return (
    <a
      href={`/api/stories/${encodeURIComponent(slug)}/document`}
      className={cn(
        "flex items-center gap-6 border-foreground px-6 py-4 text-foreground transition-colors hover:bg-foreground/5",
        getBorderClassName(variant),
      )}
    >
      <DocumentIcon className="h-[51px] w-8 shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col font-medium">
        <span className="text-[10px] uppercase leading-4 underline underline-offset-2">
          {t("Download PDF")}
        </span>
        {title && <span className="break-words text-base leading-6">{title}</span>}
      </span>
    </a>
  );
};

export default StoryDocumentLink;
