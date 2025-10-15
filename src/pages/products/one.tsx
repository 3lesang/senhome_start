import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, useNavigate, useParams } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder, UndoRedo } from "@tiptap/extensions";
import { renderToReactElement } from "@tiptap/static-renderer";
import {
	InfoIcon,
	MinusIcon,
	PercentIcon,
	PlusIcon,
	ShoppingCartIcon,
} from "lucide-react";
import { Activity, useEffect, useState } from "react";
import { toast } from "sonner";
import { getOptionsProduct } from "@/api/option/list";
import { getProductQueryOptions } from "@/api/product/one";
import { getVariantsProduct } from "@/api/variant/list";
import { CheckoutButton } from "@/components/checkout";
import { RecentProducts } from "@/components/recent-product";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import {
	calculateDiscount,
	checkBrowserId,
	cn,
	convertToFileUrl,
	formatVND,
} from "@/lib/utils";
import { cartCollection, orderCollection } from "@/stores/db";

const extensions = [
	Document,
	Paragraph,
	Text,
	Bold,
	Italic,
	Underline,
	Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
	Placeholder.configure({
		placeholder: "Nhập nội dung…",
	}),
	TextAlign.configure({
		types: ["heading", "paragraph"],
	}),
	Image,
	Link.configure({
		openOnClick: false,
		autolink: true,
	}),
	BulletList,
	OrderedList,
	ListItem,
	UndoRedo,
	Youtube.configure({
		nocookie: true,
	}),
];

type VariantType = {
	id: string;
	price: number;
	sale_price: number;
	combos: string;
	thumbnail: string;
};

export function ProductPage() {
	const navigate = useNavigate();
	const [combos, setCombos] = useState<Record<string, string>>({});
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [variant, setVariant] = useState<VariantType>();
	const [quantity, setQuantity] = useState(1);
	const [tab, setTab] = useState<"info" | "review">("info");

	const { id } = useParams({ from: "/(app)/products/$id" });
	const { data: product } = useSuspenseQuery(getProductQueryOptions(id));
	const { data: options } = useSuspenseQuery(getOptionsProduct(product.id));
	const { data: variants } = useSuspenseQuery(getVariantsProduct(product.id));

	const variantFiles = variants.map((item) => item.expand.file);
	const files = [...variantFiles, ...product.expand.file];

	function handleSelect(option: string, value: string) {
		const newCombos = { ...combos, [option]: value };
		const combosKey = Object.values(newCombos).sort().join(",");
		const index = variants.findIndex((item) => {
			const key = item.combos.split(",").sort().join(",");
			return combosKey === key;
		});
		if (index !== -1) {
			api?.scrollTo(index);
			const foundedVariant = variants[index];
			const variant: VariantType = {
				id: foundedVariant.id,
				price: foundedVariant.price,
				sale_price: foundedVariant.sale_price,
				combos: foundedVariant.combos,
				thumbnail: convertToFileUrl(foundedVariant.expand.file),
			};
			setVariant(variant);
		}
		setCombos(newCombos);
	}

	function handleAddToCart() {
		if (!variant?.id) return;
		const data = {
			id: variant.id ?? product.id,
			name: product.name,
			slug: product.slug,
			price: variant.price,
			sale_price: variant.sale_price,
			thumbnail: variant.thumbnail,
			quantity,
			combos: variant.combos,
			selected: true,
			product: product.id,
			variant: variant?.id,
		};
		const addToCart = createClientOnlyFn(() => {
			const exist = cartCollection.get(data.id);
			if (exist?.id) {
				return cartCollection.update(exist.id, (cart) => {
					cart.quantity += 1;
				});
			}
			cartCollection.insert(data);
		});
		addToCart();
		toast.success("Add to cart successfully");
	}

	function handleCheckout() {
		if (!variant?.id) return;
		const id = checkBrowserId();
		const addOrder = createClientOnlyFn(() => {
			const item = {
				id: variant.id ?? product.id,
				name: product.name,
				slug: product.slug,
				price: variant.price,
				sale_price: variant.sale_price,
				thumbnail: variant.thumbnail,
				quantity,
				combos: variant.combos,
				selected: true,
				product: product.id,
				variant: variant?.id,
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

	useEffect(() => {
		if (!api) {
			return;
		}
		setCurrent(api.selectedScrollSnap());
		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	return (
		<main>
			<ClientOnly>
				<RecentProducts
					data={{
						id: product.id,
						name: product.name,
						price: product.price,
						sale_price: product.sale_price,
						slug: product.slug,
						thumbnail: convertToFileUrl(product.expand.file[0]),
					}}
				/>
			</ClientOnly>
			<section className="max-w-6xl mx-auto">
				<Breadcrumb className="mt-4">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{product.name}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<div className="grid grid-cols-2 mt-4">
					<div className="space-y-2">
						<ClientOnly>
							<Carousel setApi={setApi}>
								<CarouselContent>
									{files.map((item, index) => (
										<CarouselItem key={`${item?.id}-${index}`}>
											<div className="w-full h-full rounded-xl bg-neutral-50 overflow-hidden aspect-square">
												{item?.id && (
													<img
														src={convertToFileUrl(item)}
														alt="file"
														className="object-contain w-full h-full"
													/>
												)}
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious className="left-2" />
								<CarouselNext className="right-2" />
							</Carousel>
						</ClientOnly>
						<div className="overflow-x-scroll">
							<div className="grid grid-cols-8 gap-2">
								{files.map((item, index) => (
									<div
										key={`${item?.id}-${index}`}
										className={cn(
											"aspect-square bg-neutral-50 border-2 rounded-md relative",
											current === index
												? "border-primary"
												: "border-transparent",
										)}
									>
										<button
											type="button"
											className="absolute inset-0 hover:cursor-pointer"
											onClick={() => api?.scrollTo(index)}
										/>
										{item?.id && (
											<img
												src={convertToFileUrl(item)}
												alt="file"
												className="w-full h-full object-contain rounded-md"
											/>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="pl-8">
						<p className="text-2xl font-light">{product.name}</p>
						<div className="my-8">
							<div className="flex items-center space-x-2">
								<Badge variant="secondary">
									{variant?.id
										? calculateDiscount(variant?.price, variant?.sale_price)
										: calculateDiscount(
												variants[0].price,
												variants[0].sale_price,
											)}
									<PercentIcon />
								</Badge>
								{variant?.id ? (
									<p className="line-through text-neutral-500 text-sm">
										{formatVND(variant.price)}
									</p>
								) : (
									<p className="line-through text-neutral-500">
										<span>{formatVND(variants?.[0].price)}</span>
										<span> - </span>
										<span>
											{formatVND(variants?.[variants.length - 1].price)}
										</span>
									</p>
								)}
							</div>
							<p className="text-3xl font-bold">
								{variant?.id ? (
									<span>{formatVND(variant.sale_price)}</span>
								) : (
									<>
										<span>{formatVND(variants?.[0].sale_price)}</span>
										<span> - </span>
										<span>
											{formatVND(variants?.[variants.length - 1].sale_price)}
										</span>
									</>
								)}
							</p>
						</div>
						<div className="space-y-8">
							{options.map((item) => {
								return (
									<div key={item.id} className="space-y-2">
										<p className="font-bold">{item.name}</p>
										<div className="grid grid-cols-2 gap-2">
											{item.values.map((v) => (
												<Button
													key={v.id}
													variant={
														combos[item.id] === v.name ? "default" : "secondary"
													}
													className=""
													onClick={() => handleSelect(item.id, v.name)}
												>
													{v.name}
												</Button>
											))}
										</div>
									</div>
								);
							})}
						</div>
						<div className="mt-8 space-y-4">
							<p className="font-bold">Số lượng</p>
							<div className="flex items-center gap-4 bg-white rounded w-fit">
								<Button
									type="button"
									variant="secondary"
									size="icon"
									onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
								>
									<MinusIcon />
								</Button>
								<span className="w-8 text-center text-sm">{quantity}</span>
								<Button
									type="button"
									variant="secondary"
									size="icon"
									onClick={() => setQuantity((q) => q + 1)}
								>
									<PlusIcon />
								</Button>
							</div>
							<Separator />
							<div className="flex justify-between my-4">
								<p className="font-bold">Số lượng sản phẩm</p>
								<p className="font-bold text-lg">
									{variant?.id && formatVND(variant?.sale_price * quantity)}
								</p>
							</div>
						</div>
						<Badge
							variant="secondary"
							className={cn(variant?.id ? "opacity-0" : "opacity-100")}
						>
							<InfoIcon />
							Vui lòng chọn loại sản phẩm
						</Badge>
						<div className="flex gap-2 items-center w-full mt-8">
							<Button
								type="button"
								size="lg"
								variant="outline"
								className="flex-1"
								onClick={handleAddToCart}
							>
								Thêm vào giỏ hàng
							</Button>
							<ClientOnly>
								<CheckoutButton />
							</ClientOnly>
							<Button
								type="button"
								size="lg"
								className="flex-1"
								onClick={handleCheckout}
							>
								Đặt hàng
							</Button>
						</div>
					</div>
				</div>
			</section>
			<section className="mt-8">
				<div className="sticky top-16 bg-white">
					<div className="max-w-6xl mx-auto grid grid-cols-8">
						<Button
							type="button"
							variant="link"
							className={cn(
								"h-16 rounded-none border-b-2",
								tab === "info" ? "border-primary" : "border-transparent",
							)}
							onClick={() => setTab("info")}
						>
							Chi tiết sản phẩm
						</Button>
						<Button
							type="button"
							variant="link"
							className={cn(
								"h-16 rounded-none border-b-2",
								tab === "review" ? "border-primary" : "border-transparent",
							)}
							onClick={() => setTab("review")}
						>
							Đánh giá
						</Button>
					</div>
					<Separator />
				</div>
				<div className="max-w-5xl mx-auto grid grid-cols-10 mt-8">
					<div className="col-span-7">
						<Activity mode={tab === "info" ? "visible" : "hidden"}>
							<div className="typography">
								{renderToReactElement({
									content: product.content,
									extensions,
								})}
							</div>
						</Activity>
						<Activity mode="hidden">
							<div></div>
						</Activity>
					</div>
					<div className="col-span-3">
						<div className="sticky top-0 h-full max-h-[1000px] flex flex-col py-4">
							<div className="flex-1"></div>
							<div className="flex gap-2 items-center">
								<Button
									type="button"
									size="icon-lg"
									variant="outline"
									onClick={handleAddToCart}
								>
									<ShoppingCartIcon />
								</Button>
								<Button
									type="button"
									size="lg"
									className="w-full"
									onClick={handleCheckout}
								>
									Đặt hàng
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
