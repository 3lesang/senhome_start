import { eq, useLiveQuery } from "@tanstack/react-db";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	InfoIcon,
	MinusIcon,
	PlusIcon,
	ShoppingCartIcon,
	Trash2Icon,
} from "lucide-react";
import { Activity } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { checkBrowserId, cn, formatVND } from "@/lib/utils";
import { cartCollection, orderCollection } from "@/stores/db";

export function CartPage() {
	const navigate = useNavigate();
	const id = checkBrowserId();
	const { data: order } = useLiveQuery((q) =>
		q
			.from({ order: orderCollection })
			.where(({ order }) => eq(order.id, id))
			.findOne(),
	);
	const { data: cart } = useLiveQuery((q) =>
		q.from({ cart: cartCollection }).select(({ cart }) => ({
			id: cart.id,
			name: cart.name,
			slug: cart.slug,
			price: cart.price,
			sale_price: cart.sale_price,
			thumbnail: cart.thumbnail,
			quantity: cart.quantity,
			combos: cart.combos,
			selected: cart.selected,
			product: cart.product,
			variant: cart.variant,
		})),
	);

	const cartSumary = cart.reduce(
		(acc, cur) => {
			return {
				totalPrice: acc.totalPrice + cur.price * cur.quantity,
				finalPrice: acc.finalPrice + cur.sale_price * cur.quantity,
			};
		},
		{ totalPrice: 0, finalPrice: 0 },
	);

	function handlePayment() {
		const addOrder = () => {
			if (order?.id) {
				return orderCollection.update(order.id, (order) => {
					order.items = cart;
				});
			}
			return orderCollection.insert({
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
				items: cart,
				note: "",
			});
		};
		addOrder();
		navigate({ to: "/checkout" });
	}

	return (
		<main className="bg-neutral-50 min-h-[calc(100vh-64px)] py-8 px-4">
			<div className="max-w-6xl mx-auto">
				<Activity mode={cart.length > 0 ? "visible" : "hidden"}>
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						<div className="lg:col-span-12">
							<Item variant="muted">
								<ItemMedia>
									<Button variant="ghost" size="icon">
										<InfoIcon />
									</Button>
								</ItemMedia>
								<ItemContent>
									<ItemTitle>Thông tin đơn hàng</ItemTitle>
								</ItemContent>
								<ItemActions>
									<Link to="/order" className={cn(buttonVariants())}>
										Đơn hàng của tôi
									</Link>
								</ItemActions>
							</Item>
						</div>
						<div className="lg:col-span-8">
							<Card className="border-0 shadow-none h-full">
								<CardHeader className="">
									<CardTitle>Giỏ hàng</CardTitle>
								</CardHeader>
								<ScrollArea className="max-h-96">
									<CardContent className="space-y-2">
										{cart.map((item) => (
											<Item key={item.id} variant="muted">
												<ItemMedia>
													<Checkbox className="bg-white" />
													<Avatar className="rounded">
														<AvatarImage src={item.thumbnail} />
														<AvatarFallback>CN</AvatarFallback>
													</Avatar>
												</ItemMedia>
												<ItemContent>
													<ItemTitle>
														<Link
															to="/products/$id"
															params={{ id: item.slug }}
															className="hover:underline line-clamp-1"
														>
															{item.name}
														</Link>
													</ItemTitle>
													<ItemDescription className="space-x-1">
														{item.combos?.split(",").map((item) => (
															<Badge key={item} variant="secondary">
																{item}
															</Badge>
														))}
														{formatVND(item.sale_price)}
													</ItemDescription>
												</ItemContent>
												<ItemActions>
													<div className="flex items-center">
														<Button
															type="button"
															variant="secondary"
															size="icon-sm"
															onClick={() => {
																if (item.quantity === 1) return;
																cartCollection.update(item.id, (cart) => {
																	cart.quantity -= 1;
																});
															}}
														>
															<MinusIcon />
														</Button>
														<span className="w-10 text-center">
															{item.quantity}
														</span>
														<Button
															type="button"
															variant="secondary"
															size="icon-sm"
															onClick={() => {
																cartCollection.update(item.id, (cart) => {
																	cart.quantity += 1;
																});
															}}
														>
															<PlusIcon />
														</Button>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="icon-sm"
														onClick={() => {
															cartCollection.delete(item.id);
														}}
													>
														<Trash2Icon />
													</Button>
												</ItemActions>
											</Item>
										))}
									</CardContent>
								</ScrollArea>
							</Card>
						</div>
						<div className="lg:col-span-4">
							<Card className="border-0 shadow-none">
								<CardHeader>
									<CardTitle>Chi tiết thanh toán</CardTitle>
								</CardHeader>
								<CardContent className="text-neutral-600 text-sm space-y-2">
									<div className="flex justify-between mb-4">
										<p>Tạm tính</p>
										<p>{formatVND(cartSumary.totalPrice)}</p>
									</div>
									<div className="flex justify-between">
										<p>Giảm giá</p>
										<p>
											{formatVND(cartSumary.totalPrice - cartSumary.finalPrice)}
										</p>
									</div>
									<div className="flex justify-between">
										<p>Phí giao hàng</p>
										<p>Miễn phí</p>
									</div>
								</CardContent>
								<Separator />
								<CardFooter className="flex justify-between">
									<p className="font-bold">Thành tiền</p>
									<p className="font-bold text-lg">
										{formatVND(cartSumary.finalPrice)}
									</p>
								</CardFooter>
							</Card>
						</div>
						<div className="lg:col-span-8" />
						<div className="lg:col-span-4">
							<Button
								type="button"
								size="lg"
								onClick={handlePayment}
								className="w-full"
							>
								Đặt hàng
							</Button>
						</div>
					</div>
				</Activity>
				<Activity mode={cart.length === 0 ? "visible" : "hidden"}>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<ShoppingCartIcon />
							</EmptyMedia>
							<EmptyTitle>Giỏ hàng của bạn đang trống!</EmptyTitle>
							<EmptyDescription>
								Tất cả các mặt hàng đều được giao hàng miễn phí. Hãy tìm những
								gì bạn yêu thích, phần còn lại là của chúng tôi.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button>Bắt đầu mua sắm</Button>
						</EmptyContent>
					</Empty>
				</Activity>
			</div>
		</main>
	);
}
