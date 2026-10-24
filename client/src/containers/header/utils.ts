export function isNavItemActive(pathname: string, href: string): boolean {
  return href === pathname || (href !== "/" && pathname.startsWith(`${href}/`));
}
