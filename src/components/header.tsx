import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, Link } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { SearchIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import {
	customerAtom,
	SIGN_UP_TYPE,
	setAuthTypeAtom,
	setOpenAtom,
	tokenAtom,
} from "@/atom/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useScrollHide } from "@/hooks/use-scroll-hide";
import { cn } from "@/lib/utils";
import { getDiscountsQueryOptions } from "@/queries/discount";
import { getMenuItemQueryOptions, getMenuQueryOptions } from "@/queries/menu";
import { CartBadge } from "./cart";

function Discount() {
	const hidden = useScrollHide(50);
	const getDiscountsQuery = useSuspenseQuery(getDiscountsQueryOptions());
	const [codeDiscount] = getDiscountsQuery.data.filter(
		(d) => d.discount_type === "code",
	);
	if (!codeDiscount) return null;
	return (
		<div
			className={`transition-all duration-150 overflow-hidden ${
				hidden ? "max-h-0" : "max-h-12"
			}`}
		>
			<div className="bg-primary text-white py-2">
				<p className="font-bold uppercase text-center text-xs">
					{codeDiscount?.description}
				</p>
			</div>
		</div>
	);
}

function AuthButton() {
	const [token] = useAtom(tokenAtom);
	const [customer] = useAtom(customerAtom);
	const [, setOpen] = useAtom(setOpenAtom);
	const [, setAuthType] = useAtom(setAuthTypeAtom);

	if (token) {
		return (
			<Link
				to="/account/info"
				className={cn(buttonVariants({ variant: "ghost" }))}
			>
				{customer?.name}
			</Link>
		);
	}
	return (
		<Button
			size="icon"
			variant="ghost"
			type="button"
			className="cursor-pointer"
			onClick={() => {
				setAuthType(SIGN_UP_TYPE);
				setOpen(true);
			}}
		>
			<UserIcon />
		</Button>
	);
}

export function Header() {
	const getFooterMenuQuery = useSuspenseQuery(getMenuQueryOptions("header"));
	const getMenuItemQuery = useSuspenseQuery(
		getMenuItemQueryOptions(getFooterMenuQuery.data?.id ?? 0),
	);

	return (
		<header className="sticky top-0 z-50 overflow-hidden">
			<div className="bg-white">
				<nav className="container mx-auto flex justify-between items-center h-16">
					<Link to="/" className="lg:flex items-center gap-1">
						<img
							src="/logo512.webp"
							alt="logo"
							className="size-16 object-cover"
						/>
					</Link>
					<NavigationMenu>
						<NavigationMenuList>
							{getMenuItemQuery.data.map((menu) => {
								if (!menu.items.length) {
									return (
										<NavigationMenuItem
											key={menu.name}
											className="rounded-full"
										>
											<NavigationMenuLink asChild>
												<Link to={menu.url}>{menu.name}</Link>
											</NavigationMenuLink>
										</NavigationMenuItem>
									);
								}
								return (
									<NavigationMenuItem key={menu.name}>
										<NavigationMenuTrigger className="rounded-full">
											{menu.name}
										</NavigationMenuTrigger>
										<NavigationMenuContent className="min-w-max">
											{menu.items.map((item) => (
												<NavigationMenuLink
													key={item.name}
													asChild
													className="rounded-full"
												>
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
						<Button
							type="button"
							variant="outline"
							className="hidden lg:flex rounded-full h-12 w-72 justify-start"
						>
							<SearchIcon />
							Tìm kiếm sản phẩm...
						</Button>
						<AuthButton />
						<Link
							to="/cart"
							className={cn(
								buttonVariants({ variant: "ghost", size: "icon" }),
								"relative rounded-full",
							)}
						>
							<ShoppingCartIcon />
							<ClientOnly fallback={null}>
								<CartBadge />
							</ClientOnly>
						</Link>
					</div>
				</nav>
			</div>
			<Discount />
		</header>
	);
}
