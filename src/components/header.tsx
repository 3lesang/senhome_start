/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
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
	XIcon,
} from "lucide-react";
import { useState } from "react";
import {
	customerAtom,
	SIGN_UP_TYPE,
	setAuthTypeAtom,
	setOpenAtom,
	tokenAtom,
} from "@/atom/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	calculateDiscount,
	cn,
	convertToFileUrl,
	formatVND,
} from "@/lib/utils";
import { getDiscountsQueryOptions } from "@/queries/discount";
import { getMenuItemQueryOptions, getMenuQueryOptions } from "@/queries/menu";
import { getSearchProductsQueryOptions } from "@/queries/product";
import { CartBadge } from "./cart";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { ScrollArea } from "./ui/scroll-area";

function Discount() {
	const getDiscountsQuery = useSuspenseQuery(getDiscountsQueryOptions());
	const [codeDiscount] =
		getDiscountsQuery.data?.filter((d) => d.discount_type === "code") ?? [];

	if (!codeDiscount) return null;
	return (
		<div>
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
											<NavigationMenuLink className="font-semibold text-gray-900 pb-2 border-b border-gray-200">
												<Link to={category.url}>{category.name}</Link>
											</NavigationMenuLink>
											{category.items && category.items.length > 0 && (
												<ul className="space-y-2">
													{category.items.map((item, itemIdx) => (
														<li key={itemIdx}>
															<NavigationMenuLink asChild>
																<Link
																	to={item.url || "#"}
																	className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
																>
																	<div className="flex items-center justify-between">
																		<span>{item.name}</span>
																		{item.items && item.items.length > 0 && (
																			<ChevronRightIcon className="w-4 h-4" />
																		)}
																	</div>
																</Link>
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

type MenuItemData = {
	name: string;
	url: string;
	items: MenuItemData[];
};

const MenuItem = ({
	item,
	level = 0,
}: {
	item: MenuItemData;
	level?: number;
}) => {
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
						<ChevronDown className="w-4 h-4 mr-2" />
					) : (
						<ChevronRight className="w-4 h-4 mr-2" />
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

function MobileMenu() {
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

function SearchInput() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const getSearchProductsQuery = useQuery(getSearchProductsQueryOptions(query));

	if (open) {
		return (
			<div className="z-50 fixed inset-0">
				<div className="absolute z-30 left-0 right-0 bg-white py-2 px-4">
					<div className="flex items-center gap-2">
						<InputGroup className="h-12 rounded-full container mx-auto">
							<InputGroupInput
								placeholder="Tìm kiếm sản phẩm..."
								autoFocus
								onChange={(e) => setQuery(e.currentTarget.value)}
							/>
							<InputGroupAddon>
								<SearchIcon />
							</InputGroupAddon>
						</InputGroup>
						<Button
							type="button"
							size="icon"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							<XIcon />
						</Button>
					</div>
					{!getSearchProductsQuery.isLoading && (
						<div className="container mx-auto mt-4 space-y-4">
							<p className="font-bold">Kết quả tìm kiếm</p>
							<ScrollArea className="h-screen lg:h-fit">
								<div className="grid grid-cols-2 lg:grid-cols-12 gap-2">
									{getSearchProductsQuery.data?.data.data?.map((p) => (
										<Card
											key={p.id}
											className="border-0 shadow-none rounded-2xl overflow-hidden"
										>
											<img
												src={convertToFileUrl(p.file)}
												alt=""
												className="aspect-square object-contain"
											/>
											<CardContent className="px-0 space-y-1">
												<p className="line-clamp-2 text-sm font-light hover:underline">
													<Link
														to="/products/$id"
														params={{ id: p.slug }}
														onClick={() => setOpen(false)}
													>
														{p.name}
													</Link>
												</p>
												<div className="flex items-center space-x-2">
													<Badge variant="secondary">
														-{calculateDiscount(p.origin_price, p.sale_price)}%
													</Badge>
													<p className="line-through text-xs text-neutral-700">
														{formatVND(p.origin_price)}
													</p>
												</div>
												<p className="text-lg font-bold">
													{formatVND(p.sale_price)}
												</p>
											</CardContent>
										</Card>
									))}
								</div>
							</ScrollArea>
						</div>
					)}
				</div>
				{/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
				{/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					className="absolute inset-0 bg-black/30 z-20"
					onClick={() => setOpen(false)}
				/>
			</div>
		);
	}
	return (
		<Button
			type="button"
			variant="outline"
			className="rounded-full h-12 lg:w-72 justify-start"
			onClick={() => setOpen(true)}
		>
			<SearchIcon />
			Tìm kiếm sản phẩm...
		</Button>
	);
}

export function Header() {
	return (
		<header className="sticky top-0 z-50">
			<div className="bg-white">
				<nav className="container mx-auto flex justify-between items-center h-16">
					<div className="lg:hidden">
						<MobileMenu />
					</div>
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
						<SearchInput />
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
