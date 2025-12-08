import { Link, useNavigate } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import _ from "lodash";
import { ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import {
	calculateDiscount,
	checkBrowserId,
	convertToFileUrl,
	formatVND,
} from "@/lib/utils";
import { cartCollection, orderCollection } from "@/stores/db";
import { ButtonGroup } from "./ui/button-group";

type ProductOption = {
	id: number;
	name: string;
	values: { id: number; name: string }[];
};

type ProductVariant = {
	id: number;
	origin_price: number;
	sale_price: number;
	options: Record<string, string>;
	file: string;
};

type ProductCardData = {
	id: number;
	name: string;
	slug: string;
	files: string[];
	salePrice: number;
	originPrice: number;
	options: ProductOption[];
	variants: ProductVariant[];
};

interface ProductCardProps {
	data: ProductCardData;
}

interface ProductOptionsProps {
	data: { id: number; name: string; values: { id: number; name: string }[] }[];
	onChange?: (value: Record<string, string>) => void;
	value?: Record<string, string>;
}

const ProductOptions = ({ value, data, onChange }: ProductOptionsProps) => {
	const [options, setOptions] = useState<Record<string, string>>(
		value ? value : {},
	);
	function handleSelect(optionName: string, value: string) {
		const nextOptions = { ...options, [optionName]: value };
		setOptions(nextOptions);
		onChange?.(nextOptions);
	}
	return (
		<div className="space-y-4">
			{data?.map((o) => {
				return (
					<div key={o.id} className="space-y-2">
						<p className="text-sm font-medium">{o.name}</p>
						<div className="flex flex-wrap gap-2">
							{o.values?.map((v) => (
								<Button
									key={v.id}
									variant={options[o.name] === v.name ? "default" : "secondary"}
									className="rounded-full"
									onClick={() => handleSelect(o.name, v.name)}
								>
									{v.name}
								</Button>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
};

const ADD_TO_CART = 1;
const CHECKOUT = 2;

export function ProductCard({ data }: ProductCardProps) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [firstFile, secondFile] = data.files;
	const variants = data.variants;
	const [mode, setMode] = useState<number>();
	const [variant, setVariant] = useState<ProductVariant | null>(null);

	function handleOptionsChange(value: Record<string, string>) {
		const index = variants.findIndex((v) => _.isEqual(v.options, value));
		if (index === -1) return;
		setVariant(variants[index]);
	}

	function handleAddToCart() {
		const item = {
			id: variant?.id.toString() ?? data.id.toString(),
			name: data.name,
			slug: data.slug,
			price: variant?.origin_price ?? 0,
			sale_price: variant?.sale_price ?? 0,
			thumbnail: variant?.file ?? "",
			quantity: 1,
			combos: variant?.options
				? Object.values(variant?.options).join(", ")
				: "",
			selected: true,
			product: data.id.toString(),
			variant: variant?.id.toString() ?? "",
		};
		const addToCart = createClientOnlyFn(() => {
			const exist = cartCollection.get(data.id.toString());
			if (exist?.id) {
				return cartCollection.update(exist.id, (cart) => {
					cart.quantity += 1;
				});
			}
			cartCollection.insert(item);
		});
		addToCart();
		toast.success("Đã thêm vào giỏ hàng", {
			action: {
				label: "Xem giỏ hàng",
				onClick: () => navigate({ to: "/cart" }),
			},
			position: "bottom-center",
		});
	}

	function handleCheckout() {
		const id = checkBrowserId();
		const addOrder = createClientOnlyFn(() => {
			const item = {
				id: variant?.id.toString() ?? data.id.toString(),
				name: data.name,
				slug: data.slug,
				price: variant?.origin_price ?? 0,
				sale_price: variant?.sale_price ?? 0,
				thumbnail: variant?.file ?? "",
				quantity: 1,
				combos: variant?.options
					? Object.values(variant?.options).join(", ")
					: "",
				selected: true,
				product: data.id.toString(),
				variant: variant?.id.toString() ?? "",
			};
			const order = orderCollection.get(id);
			if (order?.id) {
				orderCollection.update(order.id, (order) => {
					order.items = [item];
				});
				return;
			}
			orderCollection.insert({
				id,
				name: "",
				phone: "",
				email: "",
				street: "",
				province: { label: "", value: "" },
				district: { label: "", value: "" },
				ward: { label: "", value: "" },
				status: "created",
				payment: "cod",
				items: [item],
				note: "",
			});
		});
		addOrder();
		navigate({ to: "/checkout" });
	}

	return (
		<>
			<Card key={data.id} className="border-0 shadow-none p-0">
				<div className="aspect-square bg-neutral-50 rounded-md relative group">
					<Link
						to="/products/$id"
						params={{ id: data.slug }}
						className="group-hover:opacity-0 transition-opacity duration-150"
					>
						<img
							src={convertToFileUrl(firstFile)}
							alt=""
							className="rounded aspect-square object-contain"
						/>
					</Link>
					<Link
						to="/products/$id"
						params={{ id: data.slug }}
						className="opacity-0 group-hover:opacity-100 absolute inset-0 z-20 transition-opacity duration-150"
					>
						<img
							src={convertToFileUrl(secondFile)}
							alt=""
							className="rounded aspect-square object-contain"
						/>
					</Link>
					<div className="flex items-center gap-2 absolute right-2 bottom-2 z-30">
						<ButtonGroup>
							<Button
								type="button"
								size="icon"
								className="cursor-pointer rounded-full"
								onClick={() => {
									setMode(ADD_TO_CART);
									setOpen(true);
								}}
							>
								<ShoppingCartIcon />
							</Button>
							<Button
								type="button"
								className="cursor-pointer rounded-full"
								onClick={() => {
									setMode(CHECKOUT);
									setOpen(true);
								}}
							>
								Mua ngay
							</Button>
						</ButtonGroup>
					</div>
				</div>
				<CardContent className="px-0 space-y-1">
					<p className="line-clamp-2 text-sm font-light hover:underline">
						<Link to="/products/$id" params={{ id: data.slug }}>
							{data.name}
						</Link>
					</p>
					<div className="flex items-center space-x-2">
						<Badge variant="secondary">
							-{calculateDiscount(data.originPrice, data.salePrice)}%
						</Badge>
						<p className="line-through text-xs text-neutral-700">
							{formatVND(data.originPrice)}
						</p>
					</div>
					<p className="text-lg font-bold">{formatVND(data.salePrice)}</p>
				</CardContent>
			</Card>
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerContent className="lg:max-w-lg mx-auto px-8 pb-4">
					<DrawerHeader>
						<DrawerTitle>Chọn loại sản phẩm?</DrawerTitle>
					</DrawerHeader>
					<div className="">
						{variant?.id && (
							<Item>
								<ItemMedia>
									<img
										className="size-14 object-contain bg-neutral-50 rounded-lg"
										src={convertToFileUrl(variant.file)}
										alt=""
									/>
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{data.name}</ItemTitle>
									<ItemDescription>{}</ItemDescription>
								</ItemContent>
								<p className="font-bold text-lg">
									{formatVND(variant.sale_price)}
								</p>
							</Item>
						)}
						<ProductOptions
							data={data.options}
							onChange={handleOptionsChange}
						/>
						{mode === ADD_TO_CART && (
							<Button
								type="button"
								className="cursor-pointer w-full rounded-full mt-8 h-12"
								onClick={handleAddToCart}
							>
								Thêm vào giỏ
							</Button>
						)}
						{mode === CHECKOUT && (
							<Button
								type="button"
								className="cursor-pointer w-full rounded-full mt-8 h-12"
								onClick={handleCheckout}
							>
								Mua ngay
							</Button>
						)}
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}
