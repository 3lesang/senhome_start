/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, Link } from "@tanstack/react-router";
import { useAtom } from "jotai";
import {
	ChevronDown,
	ChevronRight,
	ChevronRightIcon,
	MenuIcon,
	SearchIcon,
	ShoppingCartIcon,
	UserIcon,
} from "lucide-react";
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
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { useMediaQuery } from "@uidotdev/usehooks";

function Discount() {
	const hidden = useScrollHide(50);
	const getDiscountsQuery = useSuspenseQuery(getDiscountsQueryOptions());
	const [codeDiscount] =
		getDiscountsQuery.data?.filter((d) => d.discount_type === "code") ?? [];

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

function NavMenu() {
	const getFooterMenuQuery = useSuspenseQuery(getMenuQueryOptions("header"));
	const getMenuItemQuery = useSuspenseQuery(
		getMenuItemQueryOptions(getFooterMenuQuery.data?.id ?? 0),
	);
	return (
		<NavigationMenu>
			<NavigationMenuList>
				{getMenuItemQuery.data.map((topLevel, idx) => (
					<NavigationMenuItem key={idx}>
						<NavigationMenuTrigger className="text-base font-medium">
							{topLevel.name}
						</NavigationMenuTrigger>
						<NavigationMenuContent className="">
							<div className="w-[800px] p-6">
								<div className="grid grid-cols-3 gap-8">
									{topLevel.items.map((category, catIdx) => (
										<div key={catIdx} className="space-y-3">
											<div className="font-semibold text-gray-900 pb-2 border-b border-gray-200">
												{category.name}
											</div>
											{category.items && category.items.length > 0 && (
												<ul className="space-y-2">
													{category.items.map((item, itemIdx) => (
														<li key={itemIdx}>
															<NavigationMenuLink asChild>
																<a
																	href={item.url || "#"}
																	className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
																>
																	<div className="flex items-center justify-between">
																		<span>{item.name}</span>
																		{item.items && item.items.length > 0 && (
																			<ChevronRightIcon className="w-4 h-4" />
																		)}
																	</div>
																</a>
															</NavigationMenuLink>
														</li>
													))}
												</ul>
											)}
										</div>
									))}
								</div>
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>
				))}
			</NavigationMenuList>
		</NavigationMenu>
	);
}

const MenuItem = ({ item, level = 0 }) => {
	const [isOpen, setIsOpen] = useState(false);
	const hasChildren = item.items && item.items.length > 0;

	if (!hasChildren) {
		return (
			<div
				className="py-2 px-4 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
				style={{ paddingLeft: `${(level + 1) * 16}px` }}
			>
				<span className="text-sm text-gray-700">{item.name}</span>
			</div>
		);
	}

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger className="w-full">
				<div
					className="flex items-center py-2 px-4 hover:bg-gray-100 cursor-pointer rounded-md transition-colors"
					style={{ paddingLeft: `${level * 16}px` }}
				>
					{isOpen ? (
						<ChevronDown className="w-4 h-4 mr-2 flex-shrink-0" />
					) : (
						<ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
					)}
					<span className="text-sm font-medium text-gray-800">{item.name}</span>
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="mt-1">
					{item.items.map((child, index) => (
						<MenuItem key={index} item={child} level={level + 1} />
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
};

function Bugger() {
	const getFooterMenuQuery = useSuspenseQuery(getMenuQueryOptions("header"));
	const getMenuItemQuery = useSuspenseQuery(
		getMenuItemQueryOptions(getFooterMenuQuery.data?.id ?? 0),
	);

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button type="button" size="icon" variant="ghost" className="lg:hidden">
					<MenuIcon />
				</Button>
			</SheetTrigger>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle></SheetTitle>
					<SheetDescription></SheetDescription>
				</SheetHeader>
				<div className="px-2">
					{getMenuItemQuery.data.map((item, index) => (
						<MenuItem key={index} item={item} />
					))}
				</div>
			</SheetContent>
		</Sheet>
	);
}

export function Header() {
	const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
	return (
		<header className="sticky top-0 z-50">
			<div className="bg-white">
				<nav className="container mx-auto flex justify-between items-center h-16">
					{isSmallDevice && <Bugger />}
					<Link to="/" className="lg:flex items-center gap-1">
						<img
							src="/logo512.png"
							alt="logo"
							className="size-12 lg:size-16 object-cover"
						/>
					</Link>
					<div className="hidden lg:block">
						<NavMenu />
					</div>
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
