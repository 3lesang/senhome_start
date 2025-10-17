import { eq, useLiveQuery } from "@tanstack/react-db";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	MinusIcon,
	PlusIcon,
	ShoppingCartIcon,
	Trash2Icon,
} from "lucide-react";
import { Activity } from "react";
import { toast } from "sonner";
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
	ItemHeader,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
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
				totalSalePrice: acc.totalSalePrice + cur.sale_price * cur.quantity,
			};
		},
		{ totalPrice: 0, totalSalePrice: 0 },
	);

	function handlePayment() {
		const selectedCart = cart.filter((item) => item.selected);
		if (!selectedCart.length) {
			toast("Vui lòng chọn sản phẩm");
			return;
		}
		const addOrder = () => {
			if (order?.id) {
				return orderCollection.update(order.id, (order) => {
					order.items = selectedCart;
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
				items: selectedCart,
				note: "",
			});
		};
		addOrder();
		navigate({ to: "/checkout" });
	}

	return (
		<main className="py-4">
			<div className="max-w-6xl mx-auto">
				<Activity mode={cart.length > 0 ? "visible" : "hidden"}>
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						<div className="lg:col-span-8 space-y-4">
							<Item>
								<ItemHeader>
									<Label>
										<Checkbox />
										Chọn tất cả
									</Label>
									<Button type="button" variant="ghost">
										Xóa lựa chọn
									</Button>
								</ItemHeader>
							</Item>
							{cart.map((item) => (
								<Item key={item.id} variant="muted">
									<ItemMedia>
										<Checkbox
											defaultChecked={item.selected}
											className="bg-white"
											onCheckedChange={(checked) => {
												cartCollection.update(item.id, (cart) => {
													cart.selected = checked as boolean;
												});
											}}
										/>
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
										</ItemDescription>
										<div className="space-x-2">
											<span className="font-bold">
												{formatVND(item.sale_price)}
											</span>
											<span className="line-through">
												{formatVND(item.price)}
											</span>
										</div>
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
											<span className="w-10 text-center">{item.quantity}</span>
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
						</div>
						<div className="lg:col-span-4">
							<Card className="border-0 shadow-none sticky top-20">
								<CardHeader>
									<CardTitle>Chi tiết thanh toán</CardTitle>
								</CardHeader>
								<CardContent className="text-neutral-600 text-sm space-y-2">
									<div className="flex justify-between mb-4">
										<p>Tạm tính</p>
										<p>{formatVND(cartSumary.totalSalePrice)}</p>
									</div>
									<div className="flex justify-between">
										<p>Giảm giá</p>
										<p>
											{formatVND(
												cartSumary.totalPrice - cartSumary.totalSalePrice,
											)}
										</p>
									</div>
									<div className="flex justify-between">
										<p>Phí giao hàng</p>
										<p>Miễn phí</p>
									</div>
									<Separator />
									<div className="flex justify-between">
										<p className="font-bold">Thành tiền</p>
										<p className="font-bold text-lg">
											{formatVND(cartSumary.totalSalePrice)}
										</p>
									</div>
								</CardContent>
								<CardFooter>
									<Button
										type="button"
										size="lg"
										onClick={handlePayment}
										className="w-full"
									>
										Đặt hàng
									</Button>
								</CardFooter>
							</Card>
						</div>
					</div>
				</Activity>
				<Activity mode={cart.length === 0 ? "visible" : "hidden"}>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<ShoppingCartIcon />
							</EmptyMedia>
							<EmptyTitle>Giỏ hàng trống!</EmptyTitle>
							<EmptyDescription>
								Hãy tìm những gì bạn yêu thích.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Link to="/" className={cn(buttonVariants())}>
								Mua sắm
							</Link>
						</EmptyContent>
					</Empty>
				</Activity>
			</div>
		</main>
	);
}
