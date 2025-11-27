import { eq, useLiveQuery } from "@tanstack/react-db";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	MinusIcon,
	PlusIcon,
	ShoppingCartIcon,
	Trash2Icon,
} from "lucide-react";
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
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
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

	const cartSumary = cart
		.filter((item) => item.selected)
		.reduce(
			(acc, cur) => {
				return {
					totalPrice: acc.totalPrice + cur.price * cur.quantity,
					totalSalePrice: acc.totalSalePrice + cur.sale_price * cur.quantity,
					totalQuantity: acc.totalQuantity + cur.quantity,
				};
			},
			{ totalPrice: 0, totalSalePrice: 0, totalQuantity: 0 },
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

	if (cart.length === 0) {
		return (
			<main className="bg-neutral-50 flex-1">
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ShoppingCartIcon />
						</EmptyMedia>
						<EmptyTitle>Giỏ hàng trống!</EmptyTitle>
						<EmptyDescription>Hãy tìm những gì bạn yêu thích.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Link to="/" className={cn(buttonVariants(), "uppercase")}>
							Mua sắm ngay
						</Link>
					</EmptyContent>
				</Empty>
			</main>
		);
	}

	return (
		<main className="lg:bg-neutral-50">
			<div className="container mx-auto lg:py-4">
				<p className="font-semibold text-xl mb-4 uppercase">Giỏ Hàng</p>
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-64 lg:pb-0">
					<div className="lg:col-span-9 space-y-4">
						{cart.map((item) => (
							<Item key={item.id} className="bg-white">
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
								</ItemContent>
								<ItemActions className="space-x-4">
									<div className="flex items-center">
										<Button
											type="button"
											variant="outline"
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
											variant="outline"
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
									<div className="space-x-2">
										<p className="font-bold">{formatVND(item.sale_price)}</p>
										<p className="line-through text-xs text-neutral-500">
											{formatVND(item.price)}
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
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
					<div className="lg:col-span-3">
						<Card className="border-0 shadow-none fixed bottom-0 right-0 left-0 lg:static">
							<CardHeader>
								<CardTitle>Chi tiết thanh toán</CardTitle>
							</CardHeader>
							<CardContent className="text-neutral-600 text-sm space-y-2">
								<div className="flex justify-between mb-4">
									<p>Tổng tiền hàng</p>
									<p>{formatVND(cartSumary.totalSalePrice)}</p>
								</div>
								<div className="flex justify-between">
									<p>Giảm giá</p>
									<p></p>
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
									Mua Hàng
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
