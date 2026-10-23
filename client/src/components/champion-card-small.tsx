import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ChampionCardSmallProps = {
  variant: string;
  href: string;
  title: string;
  subtitle?: string;
  location?: string;
  className?: string;
};

const ChampionCardSmall = ({
  variant,
  href,
  title,
  subtitle,
  location,
  className,
}: ChampionCardSmallProps) => (
  <Link
    href={href}
    className={cn("flex min-w-0 flex-col gap-2.5 break-words p-4", variant, className)}
  >
    <div className="text-xs leading-4">
      <p className="font-medium">{title}</p>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {location && <p className="text-[10px] leading-4">{location}</p>}
  </Link>
);

export default ChampionCardSmall;
