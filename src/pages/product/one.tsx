import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import _ from "lodash";
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import type { CarouselApi } from "@/components/ui/carousel";
import { calculateDiscount, checkBrowserId } from "@/lib/utils";
import { getProductBySlugQueryOptions } from "@/queries/product";
import { getOverviewByProductQueryOptions } from "@/queries/review";
import { cartCollection, orderCollection } from "@/stores/db";
import { ProductCarousel } from "./components/carousel";
import { ProductContent } from "./components/content";
import { ProductDiscount } from "./components/discount";
import { ProductInfo } from "./components/info";
import { ProductOptions } from "./components/option";
import { ProductReview } from "./components/review";
import { ProductSuggest } from "./components/suggest";

export function ProductPage() {
	const navigate = useNavigate();
	const { id } = useParams({ from: "/(app)/products/$id" });
	const getProductQuery = useSuspenseQuery(getProductBySlugQueryOptions(id));
	const product = getProductQuery.data;
	const variants = product.variants;
	const getOverviewQuery = useSuspenseQuery(
		getOverviewByProductQueryOptions(product.id),
	);

	const [variant, setVariant] = useState(variants[0]);
	const [quantity, setQuantity] = useState(1);
	const carouselRef = useRef<CarouselApi>(null);
	const reviewSectionRef = useRef<HTMLDivElement>(null);

	const price = variant?.origin_price ?? getProductQuery.data.origin_price;
	const sale_price = variant?.sale_price ?? getProductQuery.data.sale_price;
	const discount = calculateDiscount(price, sale_price);

	const variantFiles = variants.map((v) => v.file);
	const files = [...getProductQuery.data.files, ...variantFiles];

	function handleOptionsChange(value: Record<string, string>) {
		const index = variants.findIndex((v) => _.isEqual(v.options, value));
		if (index === -1) return;
		const scrollToIndex = getProductQuery.data.files.length + index;
		carouselRef.current?.scrollTo(scrollToIndex);
		setVariant(variants[index]);
	}

	function handleAddToCart() {
		const product = getProductQuery.data;
		const data = {
			id: variant.id.toString() ?? product.id.toString(),
			name: product.name,
			slug: product.slug,
			price: variant.origin_price,
			sale_price: variant.sale_price,
			thumbnail: variant.file,
			quantity,
			combos: Object.values(variant.options).join(", "),
			selected: true,
			product: product.id.toString(),
			variant: variant?.id.toString(),
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
			action: {
				label: "Xem giỏ hàng",
				onClick: () => navigate({ to: "/cart" }),
			},
			position: "bottom-center",
		});
	}

	function handleCheckout() {
		const id = checkBrowserId();
		const product = getProductQuery.data;

		const addOrder = createClientOnlyFn(() => {
			const item = {
				id: variant.id.toString() ?? product.id.toString(),
				name: product.name,
				slug: product.slug,
				price: variant.origin_price,
				sale_price: variant.sale_price,
				thumbnail: variant.file,
				quantity,
				combos: Object.values(variant.options).join(", "),
				selected: true,
				product: product.id.toString(),
				variant: variant?.id.toString(),
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

	function decreaseQuantity() {
		setQuantity((state) => (state > 1 ? state - 1 : 1));
	}

	function increaseQuantity() {
		setQuantity((state) => state + 1);
	}

	return (
		<main>
			<div className="py-8">
				<Breadcrumb className="max-w-6xl mx-auto">
					<BreadcrumbList className="text-sm flex-nowrap">
						<BreadcrumbItem>
							<BreadcrumbLink href="/" className="whitespace-nowrap">
								Trang chủ
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem className="line-clamp-1">
							{getProductQuery.data.name}
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 py-8">
					<ProductCarousel ref={carouselRef} data={files} />
					<div className="px-4">
						<ProductInfo
							data={{
								name: getProductQuery.data.name,
								totalReviews: getOverviewQuery.data?.total_reviews,
								averageRating: getOverviewQuery.data.average_rating,
								discount: discount,
								originPrice: price,
								salePrice: sale_price,
							}}
							onReviewClick={() => {
								reviewSectionRef.current?.scrollIntoView({
									behavior: "smooth",
								});
							}}
						/>
						<ProductDiscount />
						<ProductOptions
							value={variant?.options}
							data={getProductQuery.data?.options}
							onChange={handleOptionsChange}
						/>
						<div className="mt-8 space-y-4">
							<Button
								variant="outline"
								className="h-12 rounded-full w-full cursor-pointer"
								onClick={handleAddToCart}
							>
								<ShoppingCartIcon />
								Thêm vào giỏ
							</Button>
							<ButtonGroup className="[--radius:9999rem] w-full">
								<ButtonGroup>
									<Button
										size="icon"
										variant="secondary"
										className="h-12 cursor-pointer"
										onClick={decreaseQuantity}
									>
										<MinusIcon />
									</Button>
									<input
										className="h-12 outline-0 w-8 text-center bg-neutral-100 text-sm rounded-none"
										value={quantity}
										onChange={(e) => {
											const quantity = Number(e.currentTarget.value) || 1;
											setQuantity(quantity);
										}}
									/>
									<Button
										variant="secondary"
										className="h-12 cursor-pointer"
										onClick={increaseQuantity}
									>
										<PlusIcon />
									</Button>
								</ButtonGroup>
								<ButtonGroup className="w-full">
									<Button
										className="h-12 w-full cursor-pointer"
										onClick={handleCheckout}
									>
										Mua ngay
									</Button>
								</ButtonGroup>
							</ButtonGroup>
						</div>
					</div>
				</div>
			</div>
			<ProductContent slug={product.slug} />
			<div ref={reviewSectionRef}>
				<ProductReview id={product.id} />
			</div>
			<ProductSuggest productId={product.id} categoryId={product.category_id} />
		</main>
	);
}
