import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { getMenuItemQueryOptions, getMenuQueryOptions } from "@/queries/menu";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, Link } from "@tanstack/react-router";
import { SearchIcon, ShoppingBagIcon, UserIcon } from "lucide-react";
import { CartBadge } from "./cart";

export function Header() {
  const getFooterMenuQuery = useSuspenseQuery(getMenuQueryOptions("header"));
  const getMenuItemQuery = useSuspenseQuery(
    getMenuItemQueryOptions(getFooterMenuQuery.data?.id ?? 0),
  );
  return (
    <header className="bg-white px-4 sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center h-16">
        <Link to="/" className="lg:flex items-center gap-1">
          <img src="/logo512.webp" alt="logo" className="size-16 object-cover" />
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {getMenuItemQuery.data.map((menu) => {
              if (!menu.items.length) {
                return (
                  <NavigationMenuItem key={menu.name}>
                    <NavigationMenuLink asChild>
                      <Link to={menu.url}>{menu.name}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              }
              return (
                <NavigationMenuItem key={menu.name}>
                  <NavigationMenuTrigger>{menu.name}</NavigationMenuTrigger>
                  <NavigationMenuContent className="min-w-max">
                    {menu.items.map((item) => (
                      <NavigationMenuLink key={item.name} asChild>
                        <Link to={item.url}>{item.name}</Link>
                      </NavigationMenuLink>
                    ))}
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-1">
          <Button type="button" variant="secondary" className="hidden lg:flex">
            <SearchIcon />
            Tìm kiếm sản phẩm...
          </Button>
          <Link
            to="/signup"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            <UserIcon />
            Tài khoản
          </Link>
          <Link
            to="/cart"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative",
            )}
          >
            <ShoppingBagIcon />
            <ClientOnly fallback={null}>
              <CartBadge />
            </ClientOnly>
          </Link>
        </div>
      </nav>
    </header>
  );
}
