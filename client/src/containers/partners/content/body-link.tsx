import type { ReactNode } from "react";

type BodyLinkProps = {
  href?: string;
  children: ReactNode;
};

const BodyLink = ({ href, children }: BodyLinkProps) => {
  if (!href) return <>{children}</>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline transition-opacity [text-decoration-skip-ink:none] [text-underline-position:from-font] hover:opacity-80"
    >
      {children}
    </a>
  );
};

export default BodyLink;
