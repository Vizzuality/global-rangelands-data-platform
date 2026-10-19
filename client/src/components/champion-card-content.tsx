import { Link } from "@/i18n/navigation";

type ChampionCardContentProps = {
  href: string;
  title: string;
  subtitle?: string;
  location?: string;
};

const ChampionCardContent = ({ href, title, subtitle, location }: ChampionCardContentProps) => (
  <Link
    href={href}
    className="flex h-full min-h-[210px] w-full min-w-0 flex-col justify-between gap-6 break-words bg-white p-8 text-champion-ink focus-visible:underline focus-visible:outline-none"
  >
    <div className="text-base leading-6">
      <h3 className="font-medium">{title}</h3>
      {subtitle && <p className="font-normal">{subtitle}</p>}
    </div>
    {location && <p className="text-xs font-medium leading-5">{location}</p>}
  </Link>
);

export default ChampionCardContent;
