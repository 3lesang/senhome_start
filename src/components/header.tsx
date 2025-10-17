import { ClientOnly, Link } from "@tanstack/react-router";
import { CircleUserIcon, SearchIcon, ShoppingBagIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CartBadge } from "./cart";

export function Header() {
	return (
		<header className="bg-white px-0 lg:px-4">
			<nav className="max-w-6xl mx-auto flex justify-between items-center h-16">
				<Link to="/" className="hidden lg:flex items-center gap-1">
					<img src="/logo.jpg" alt="logo" className="size-12 object-contain" />
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
						<CircleUserIcon />
						Đăng ký
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
