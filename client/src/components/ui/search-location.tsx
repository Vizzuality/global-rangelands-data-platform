import { useTranslations } from "@/i18n";
import { PropsWithChildren } from "react";

type SearchResultListProps = PropsWithChildren & {
  title: string;
};
const SearchResultList = ({ title, children }: SearchResultListProps) => {
  return (
    <div className="border-t border-slate-200 px-1 py-1.5">
      <p className="px-2 py-1.5 text-xs text-slate-500">{title}</p>
      <ul id="location-options" role="listbox" className="">
        {children}
      </ul>
    </div>
  );
};

type SearchOption<T> = T & {
  value: number | undefined;
  label: string;
};

type SearchResultItemProps<T> = PropsWithChildren & {
  option: SearchOption<T>;
  onOptionClick: (option: SearchOption<T>) => void;
};
const SearchResultItem = <T,>({ option, onOptionClick, children }: SearchResultItemProps<T>) => {
  return (
    <li
      role="option"
      aria-selected="false"
      tabIndex={0}
      className="hover:text-secondary-500 flex cursor-pointer gap-2 rounded px-2 py-2 text-sm transition-all duration-300 hover:bg-orange-100  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-global"
      onClick={() => onOptionClick(option)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onOptionClick(option);
        }
      }}
    >
      {children}
      <span className="line-clamp-2">{option.label}</span>
    </li>
  );
};

const SearchResultItemNotFound = ({ children }: PropsWithChildren) => {
  const t = useTranslations();
  return (
    <li
      role="option"
      aria-selected="false"
      tabIndex={0}
      className="flex gap-2 rounded px-2 py-2 text-sm opacity-70"
    >
      {children}
      <span className="line-clamp-2">{t("No results")}</span>
    </li>
  );
};

export { SearchResultList, SearchResultItem, SearchResultItemNotFound };
