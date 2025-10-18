import { useSuspenseQuery } from "@tanstack/react-query";
import {
	ClientOnly,
	Link,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { renderToReactElement } from "@tiptap/static-renderer";
import { MinusIcon, PercentIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getOptionsProduct } from "@/api/option/list";
import { getProductQueryOptions } from "@/api/product/one";
import { getReviewsProductQueryOptions } from "@/api/review/list";
import { getVariantsProduct } from "@/api/variant/list";
import { CheckoutButton } from "@/components/checkout";
import { contentExtensions } from "@/components/content";
import { Rating, RatingButton } from "@/components/kibo-ui/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import {
	calculateDiscount,
	checkBrowserId,
	cn,
	convertToFileUrl,
	formatVND,
} from "@/lib/utils";
import { cartCollection, orderCollection } from "@/stores/db";

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

	const { id } = useParams({ from: "/(app)/products/$id" });
	const { data: product } = useSuspenseQuery(getProductQueryOptions(id));
	const { data: options } = useSuspenseQuery(getOptionsProduct(product.id));
	const { data: variants } = useSuspenseQuery(getVariantsProduct(product.id));
	const { data: reviews } = useSuspenseQuery(
		getReviewsProductQueryOptions(product.id),
	);

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
		if (!variant?.id) {
			toast.warning("Vui lòng chọn loại sản phẩm", {
				position: "bottom-center",
			});
			return;
		}
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
		toast.success("Đã thêm vào giỏ hàng", {
			action: (
				<Button
					type="button"
					size="sm"
					onClick={() => navigate({ to: "/cart" })}
					className="ml-auto"
				>
					Xem giỏ hàng
				</Button>
			),
			position: "bottom-center",
		});
	}

	function handleCheckout() {
		if (!variant?.id) {
			toast.warning("Vui lòng chọn loại sản phẩm", {
				position: "bottom-center",
			});
			return;
		}
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
			<section className="bg-neutral-50">
				<Breadcrumb className="py-1 max-w-6xl mx-auto">
					<BreadcrumbList className="flex-nowrap">
						<BreadcrumbItem className="whitespace-nowrap">
							<Link to="/">Trang chủ</Link>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage className="line-clamp-1">
								{product.name}
							</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</section>
			<section className="lg:max-w-6xl mx-auto lg:my-8">
				<div className="grid grid-cols-1 lg:grid-cols-2">
					<div className="space-y-2">
						<ClientOnly>
							<Carousel setApi={setApi}>
								<CarouselContent>
									{files.map((item, index) => (
										<CarouselItem key={`${item?.id}-${index}`}>
											<div className="w-full h-full bg-neutral-50 overflow-hidden aspect-square">
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
							<div className="flex gap-2">
								{files.map((item, index) => (
									<div
										key={`${item?.id}-${index}`}
										className={cn(
											"size-16 aspect-square bg-neutral-50 border-2 relative",
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
												className="w-full h-full object-contain"
											/>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
					<Card className="border-0 shadow-none">
						<CardHeader>
							<CardTitle className="text-xl lg:text-2xl font-light">
								{product.name}
							</CardTitle>
							<CardDescription className="text-primary">
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
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{options.map((item) => {
								return (
									<div key={item.id} className="space-y-4">
										<p className="font-semibold">{item.name}</p>
										<div className="flex flex-wrap gap-4">
											{item.values.map((v) => (
												<Button
													key={v.id}
													size="sm"
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
							<div className="space-y-4">
								<p className="font-semibold">Số lượng</p>
								<div className="flex items-center gap-4 bg-white rounded w-fit">
									<Button
										type="button"
										variant="secondary"
										size="icon-sm"
										onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
									>
										<MinusIcon />
									</Button>
									<span className="w-8 text-center">{quantity}</span>
									<Button
										type="button"
										variant="secondary"
										size="icon-sm"
										onClick={() => setQuantity((q) => q + 1)}
									>
										<PlusIcon />
									</Button>
								</div>
							</div>
							<div className="flex justify-between">
								<p className="font-semibold">Giá tiền</p>
								<p className="font-bold text-lg">
									{variant?.id && formatVND(variant?.sale_price * quantity)}
								</p>
							</div>
						</CardContent>
						<CardFooter className="flex gap-2 items-center">
							<Button
								type="button"
								size="lg"
								variant="outline"
								className="flex-1"
								onClick={handleAddToCart}
							>
								Thêm vào giỏ
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
						</CardFooter>
					</Card>
				</div>
			</section>
			<section className="bg-neutral-50 my-8">
				<Card className="max-w-6xl mx-auto border-0 shadow-none bg-transparent">
					<CardHeader className="lg:px-0">
						<CardTitle>Thông tin sản phẩm</CardTitle>
					</CardHeader>
					<CardContent className="lg:px-0">
						<div className="typography max-w-none">
							{renderToReactElement({
								content: product.content,
								extensions: contentExtensions,
							})}
						</div>
					</CardContent>
				</Card>
			</section>
			<section className="my-8">
				<Card className="bg-transparent max-w-6xl mx-auto border-0 shadow-none">
					<CardHeader className="lg:px-0">
						<CardTitle>Đánh giá</CardTitle>
					</CardHeader>
					<CardContent className="lg:px-0 space-y-4">
						{reviews?.items.map((item) => (
							<Item key={item.id} variant="muted">
								<ItemMedia>
									<Avatar>
										<AvatarImage
											src={convertToFileUrl(item.expand.user.expand.avatar)}
										/>
										<AvatarFallback>{item.expand.user.name[0]}</AvatarFallback>
									</Avatar>
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{item.expand.user.name}</ItemTitle>
									<ItemDescription>
										<Rating defaultValue={item.rating} readOnly>
											{[1, 2, 3, 4, 5].map((value) => (
												<RatingButton key={value} size={16} />
											))}
										</Rating>
									</ItemDescription>
								</ItemContent>
								<ItemActions />
								<ItemFooter>
									<div>
										<p>{item.content}</p>
									</div>
								</ItemFooter>
							</Item>
						))}
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
