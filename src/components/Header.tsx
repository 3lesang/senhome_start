import { ClientOnly, Link } from "@tanstack/react-router";
import { CircleUserIcon, SearchIcon, ShoppingBagIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CartBadge } from "./cart";

export function Header() {
	return (
		<header className="max-w-6xl mx-auto flex justify-between items-center h-16">
			<Link to="/">
				<Avatar className="rounded-md">
					<AvatarImage src="" />
					<AvatarFallback className="rounded-md"></AvatarFallback>
				</Avatar>
			</Link>
			{/*<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Item One</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink>Link</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>*/}
			<div className="flex items-center gap-1">
				<Button variant="ghost">
					<SearchIcon />
					Tìm kiếm sản phẩm...
				</Button>
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
				<Link to="/signin" className={cn(buttonVariants({ variant: "ghost" }))}>
					Tài khoản
					<CircleUserIcon />
				</Link>
			</div>
		</header>
	);
}
