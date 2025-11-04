import { ClientOnly, Link } from "@tanstack/react-router";
import { SearchIcon, ShoppingBagIcon, UserIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CartBadge } from "./cart";

export function Header() {
  return (
    <header className="bg-white px-4 sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center h-16">
        <Link to="/" className="lg:flex items-center gap-1">
          <img src="/logo.jpg" alt="logo" className="size-16 object-contain" />
        </Link>
        <div></div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" className="hidden lg:flex">
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
