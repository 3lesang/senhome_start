import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, useParams } from "@tanstack/react-router";
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
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { Activity, useEffect, useState } from "react";
import { toast } from "sonner";
import { getOptionsProduct } from "@/api/option/list";
import { getProductQueryOptions } from "@/api/product/one";
import { getVariantsProduct } from "@/api/variant/list";
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
import { cn, convertToFileUrl, formatVND } from "@/lib/utils";
import { cartCollection } from "@/stores/db";

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

const addToCart = createClientOnlyFn(
	(data: {
		id: string;
		name: string;
		slug: string;
		price: number;
		sale_price: number;
		thumbnail: string;
		quantity: number;
		combos: string;
		selected: boolean;
		product: string;
		variant: string;
	}) => {
		const exist = cartCollection.get(data.id);
		if (exist?.id) {
			return cartCollection.update(data.id, (cart) => {
				cart.quantity += 1;
			});
		}
		cartCollection.insert(data);
	},
);

export function ProductPage() {
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
		<main className="py-8">
			<Breadcrumb className="max-w-6xl mx-auto mb-8">
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
			<section className="max-w-6xl mx-auto">
				<div className="flex">
					<div className="space-y-2 w-14 mr-2 h-[500px] overflow-scroll">
						{files.map((item, index) => (
							<div
								key={`${item?.id}-${index}`}
								className={cn(
									"aspect-square bg-neutral-50 border-2 rounded-md relative",
									current === index ? "border-primary" : "border-transparent",
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
					<div className="flex-1">
						<ClientOnly>
							<Carousel setApi={setApi}>
								<CarouselContent>
									{files.map((item, index) => (
										<CarouselItem
											key={`${item?.id}-${index}`}
											className="aspect-square"
										>
											{item?.id && (
												<img
													src={convertToFileUrl(item)}
													alt="file"
													className="rounded-md object-contain w-full h-full"
												/>
											)}
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious className="left-2" />
								<CarouselNext className="right-2" />
							</Carousel>
						</ClientOnly>
					</div>
					<div className="flex-1 px-8">
						<p className="text-2xl font-bold">{product.name}</p>
						<div className="my-8">
							<p className="line-through text-neutral-500">
								{variant?.id ? (
									<span>{formatVND(variant.price)}</span>
								) : (
									<>
										<span>{formatVND(variants?.[0].price)}</span>
										<span> - </span>
										<span>
											{formatVND(variants?.[variants.length - 1].price)}
										</span>
									</>
								)}
							</p>
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
										<div className="flex flex-wrap gap-2">
											{item.values.map((v) => (
												<Button
													key={v.id}
													variant={
														combos[item.id] === v.name ? "default" : "secondary"
													}
													className="flex-1"
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
						<div className="mt-4 space-y-4">
							<p className="text-sm">Số lượng</p>
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
								{variant?.id && (
									<p className="font-bold text-lg">
										{formatVND(variant?.sale_price * quantity)}
									</p>
								)}
							</div>
						</div>

						<div className="flex gap-2 items-center w-full">
							<Button
								type="button"
								size="lg"
								variant="outline"
								className="flex-1"
								onClick={() => {
									if (!variant?.id) return;
									addToCart({
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
									});
									toast.success("Add to cart successfully");
								}}
							>
								Thêm vào giỏ hàng
							</Button>
							<Button type="button" size="lg" className="flex-1">
								Đặt hàng
							</Button>
						</div>
					</div>
				</div>
			</section>
			<section className="mt-8">
				<div className="sticky top-0 bg-white">
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
				<div className="max-w-5xl mx-auto grid grid-cols-10 gap-8 mt-8">
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
								<Button size="icon-lg" variant="outline">
									<ShoppingCartIcon />
								</Button>
								<Button size="lg" className="w-full">
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
