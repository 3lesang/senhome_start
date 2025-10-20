import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { renderToReactElement } from "@tiptap/static-renderer";
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getOptionsProduct } from "@/api/option/list";
import { getProductsCategoryQueryOptions } from "@/api/product/list";
import { getProductQueryOptions } from "@/api/product/one";
import { getReviewsProductQueryOptions } from "@/api/review/list";
import { getVariantsProduct } from "@/api/variant/list";
import { contentExtensions } from "@/components/content";
import { Rating, RatingButton } from "@/components/kibo-ui/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
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

export function OneProductPage() {
	const navigate = useNavigate();
	const [combos, setCombos] = useState<Record<string, string>>({});
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [collapse, setCollapse] = useState(true);
	const [variant, setVariant] = useState<VariantType>();

	const { id } = useParams({ from: "/(app)/products/$id" });
	const { data: product } = useSuspenseQuery(getProductQueryOptions(id));
	const { data: options } = useSuspenseQuery(getOptionsProduct(product.id));
	const { data: variants } = useSuspenseQuery(getVariantsProduct(product.id));
	const { data: reviews } = useSuspenseQuery(
		getReviewsProductQueryOptions(product.id),
	);

	const { data: productsCategory } = useQuery(
		getProductsCategoryQueryOptions(product.category),
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

	const price = variant?.price ?? product.price;
	const sale_price = variant?.sale_price ?? product.sale_price;
	const discount = calculateDiscount(price, sale_price);

	useEffect(() => {
		if (!api) {
			return;
		}
		setCurrent(api.selectedScrollSnap());
		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	useEffect(() => {
		const variant = variants[variants.length - 1];
		const comboKeys = variant.combos.split(",");
		const newCombo: Record<string, string> = {};
		for (const comboKey of comboKeys) {
			const option = options.find((item) =>
				item.values.map((v) => v.name).includes(comboKey),
			);
			if (option?.id) {
				newCombo[option?.id] = comboKey;
			}
		}
		setCombos(newCombo);
		setVariant({
			id: variant.id,
			price: variant.price,
			sale_price: variant.sale_price,
			thumbnail: convertToFileUrl(variant.expand.file),
			combos: variant.combos,
		});
	}, [variants, options]);

	return (
		<main className="bg-neutral-50">
			<div className="container mx-auto">
				<Breadcrumb className="py-4 font-light">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<p>{product.name}</p>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-9">
						<div className="grid grid-cols-12 gap-4">
							<div className="col-span-4">
								<Card className="border-0 shadow-none sticky top-8">
									<CardContent>
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
										<div className="overflow-scroll">
											<div className="flex gap-2">
												{files.map((item, index) => (
													<div
														key={`${item?.id}-${index}`}
														className={cn(
															"size-12 aspect-square bg-neutral-50 border-2 relative",
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
									</CardContent>
								</Card>
							</div>
							<div className="col-span-8 space-y-4">
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>
											<p className="text-xl font-semibold">{product.name}</p>
										</CardTitle>
										<CardDescription>
											<Rating defaultValue={5} readOnly>
												{[1, 2, 3, 4, 5].map((value) => (
													<RatingButton
														key={value}
														size={14}
														className="text-primary"
													/>
												))}
											</Rating>
											<div className="space-x-2">
												<span className="text-2xl font-bold text-primary">
													{formatVND(sale_price)}
												</span>
												<Badge variant="secondary">-{discount}%</Badge>
												<span className="text-sm line-through text-neutral-500">
													{formatVND(price)}
												</span>
											</div>
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{options.map((item) => {
												return (
													<div key={item.id} className="space-y-2">
														<p className="text-sm font-medium">{item.name}</p>
														<div className="flex flex-wrap gap-2">
															{item.values.map((v) => (
																<Button
																	key={v.id}
																	variant="outline"
																	size="sm"
																	className={cn(
																		combos[item.id] === v.name &&
																			"ring-2 ring-primary",
																	)}
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
									</CardContent>
								</Card>
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>Mô tả sản phẩm</CardTitle>
									</CardHeader>
									<CardContent>
										<div className={cn(collapse && "max-h-96 overflow-hidden")}>
											<div className="typography max-w-none">
												{renderToReactElement({
													content: product.content,
													extensions: contentExtensions,
												})}
											</div>
										</div>
										<div className="flex items-center justify-center pt-8 relative bg-white">
											<button
												type="button"
												className="text-sm cursor-pointer"
												onClick={() => setCollapse((prev) => !prev)}
											>
												{collapse ? "Xem thêm" : "Thu gọn"}
											</button>
										</div>
									</CardContent>
								</Card>
							</div>
							<div className="col-span-12 space-y-4">
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>Khách hàng đánh giá</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex mb-4 gap-8">
											<div>
												<p className="font-medium text-sm mb-8">Tổng quan</p>
												<div className="flex gap-4">
													<p className="font-bold text-2xl">4.8</p>
													<Rating defaultValue={5} readOnly>
														{[1, 2, 3, 4, 5].map((value) => (
															<RatingButton
																key={value}
																className="text-yellow-300"
															/>
														))}
													</Rating>
												</div>
												<p className="text-neutral-400 font-light text-sm">
													({reviews.totalItems} đánh giá)
												</p>
											</div>
											<div>
												<p className="font-medium text-sm mb-4">
													Tất cả hình ảnh (73)
												</p>
												<div>
													<img
														src="https://salt.tikicdn.com/cache/w200/ts/review/a3/55/43/44e002c9222d65f099f830a5440385b0.jpg"
														alt=""
														className="size-20 rounded"
													/>
												</div>
											</div>
										</div>
										<div className="mb-8">
											<p className="text-sm font-medium mb-4">Lọc theo</p>
											<div className="flex gap-2">
												<Button
													className="rounded-full font-light"
													variant="outline"
													size="sm"
												>
													Mới nhất
												</Button>
												<Button
													className="rounded-full font-light"
													variant="outline"
													size="sm"
												>
													Có hình ảnh
												</Button>
												<Button
													className="rounded-full font-light"
													variant="outline"
													size="sm"
												>
													5 sao
												</Button>
												<Button
													className="rounded-full font-light"
													variant="outline"
													size="sm"
												>
													4 sao
												</Button>
												<Button
													className="rounded-full font-light"
													variant="outline"
													size="sm"
												>
													3 sao
												</Button>
												<Button
													className="rounded-full font-light"
													variant="outline"
													size="sm"
												>
													2 sao
												</Button>
												<Button
													className="rounded-full font-light"
													variant="outline"
													size="sm"
												>
													1 sao
												</Button>
											</div>
										</div>
										<div className="space-y-2">
											{reviews.items.map((item) => (
												<div key={item.id} className="my-2">
													<div className="flex gap-2 items-center">
														<Avatar>
															<AvatarImage
																src={convertToFileUrl(
																	item.expand.user.expand.avatar,
																)}
															></AvatarImage>
															<AvatarFallback>
																{item.expand.user.name[0]}
															</AvatarFallback>
														</Avatar>
														<p className="font-medium">
															{item.expand.user.name}
														</p>
													</div>
													<Rating defaultValue={item.rating} readOnly>
														{[1, 2, 3, 4, 5].map((value) => (
															<RatingButton
																key={value}
																size={16}
																className="text-yellow-300"
															/>
														))}
													</Rating>
													<p className="text-sm">{item.content}</p>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>Sản phẩm tương tự</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-6 gap-4">
										{productsCategory?.items.map((item) => (
											<Card key={item.id} className="border-0 shadow-none p-0">
												<div className="aspect-square bg-neutral-50 rounded-md relative group">
													<Link to="/products/$id" params={{ id: item.slug }}>
														<img
															src={convertToFileUrl(item.expand.file[0])}
															alt=""
															className="rounded object-contain group-hover:opacity-0 transition-opacity duration-150 w-full h-full"
														/>
														<img
															src={convertToFileUrl(item.expand.file[1])}
															alt=""
															className="rounded object-contain opacity-0 group-hover:opacity-100 absolute inset-0 z-20 transition-opacity duration-150 h-full w-full"
														/>
													</Link>
													<Button
														type="submit"
														size="icon-sm"
														variant="secondary"
														className="absolute right-2 bottom-2 z-30"
													>
														<ShoppingCartIcon />
													</Button>
												</div>
												<CardContent className="px-0 space-y-1">
													<p className="line-clamp-2 text-sm font-light hover:underline">
														<Link to="/products/$id" params={{ id: item.slug }}>
															{item.name}
														</Link>
													</p>
													<div className="flex items-center space-x-2">
														<Badge variant="secondary">
															-{calculateDiscount(item.price, item.sale_price)}%
														</Badge>
														<p className="line-through text-xs text-neutral-700">
															{formatVND(item.price)}
														</p>
													</div>
													<p className="text-lg font-bold">
														{formatVND(item.sale_price)}
													</p>
												</CardContent>
											</Card>
										))}
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
					<div className="col-span-3">
						<Card className="border-0 shadow-none sticky top-8">
							<CardContent className="space-y-4">
								<div className="flex gap-2 items-center">
									<img src={variant?.thumbnail} alt="" className="size-10" />
									{variant?.combos}
								</div>
								<div className="space-y-4">
									<p className="font-semibold">Số lượng</p>
									<div className="flex items-center">
										<Button
											type="button"
											size="icon"
											variant="outline"
											onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
										>
											<MinusIcon />
										</Button>
										<div className="w-16 text-center">{quantity}</div>
										<Button
											type="button"
											size="icon"
											variant="outline"
											onClick={() => setQuantity((q) => q + 1)}
										>
											<PlusIcon />
										</Button>
									</div>
								</div>
								<div className="space-y-4">
									<p className="font-semibold">Tạm tính</p>
									<p className="font-bold text-xl">
										{formatVND(Number(variant?.sale_price) * quantity)}
									</p>
								</div>
							</CardContent>
							<CardFooter>
								<div className="w-full space-y-2">
									<Button
										type="button"
										size="lg"
										className="w-full"
										onClick={handleCheckout}
									>
										Mua ngay
									</Button>
									<Button
										type="button"
										size="lg"
										variant="outline"
										className="w-full"
										onClick={handleAddToCart}
									>
										Thêm vào giỏ
									</Button>
								</div>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
