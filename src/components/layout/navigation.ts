import { BoxIcon, FlaskIcon, PlusSquareIcon } from "@/components/ui/icons"

export interface NavItem {
  href: string
  label: string
  icon: typeof BoxIcon
  match: (pathname: string) => boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/products",
    label: "Inventory Directory",
    icon: BoxIcon,
    match: (pathname) => pathname === "/products" || /^\/products\/\d+/.test(pathname),
  },
  {
    href: "/products/new",
    label: "Product Wizard",
    icon: PlusSquareIcon,
    match: (pathname) => pathname.startsWith("/products/new"),
  },
  {
    href: "/testing",
    label: "Test StockHub",
    icon: FlaskIcon,
    match: (pathname) => pathname.startsWith("/testing"),
  },
]
