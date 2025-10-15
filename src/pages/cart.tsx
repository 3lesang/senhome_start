import { eq, useLiveQuery } from "@tanstack/react-db";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	MinusIcon,
	PlusIcon,
	ShoppingCartIcon,
	Trash2Icon,
} from "lucide-react";
import { Activity } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardAction,
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { checkBrowserId, cn, formatVND } from "@/lib/utils";
import {
	cartCollection,
	orderCollection,
	recentProductsCollection,
} from "@/stores/db";

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

	const { data: products } = useLiveQuery((q) =>
		q.from({ product: recentProductsCollection }),
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
		<main className="bg-neutral-50 h-[calc(100vh-64px)]">
			<div className="max-w-6xl mx-auto">
				<Card className="bg-neutral-50 border-0 shadow-none">
					<CardHeader>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<Link to="/">Trang chủ</Link>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage>Giỏ hàng</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
						<CardTitle>Giỏ hàng của bạn</CardTitle>
						<CardAction>
							<Link
								to="/order"
								className={cn(buttonVariants({ variant: "ghost" }))}
							>
								<ShoppingCartIcon />
								Đơn hàng của tôi
							</Link>
						</CardAction>
					</CardHeader>
					<Activity mode={cart.length > 0 ? "visible" : "hidden"}>
						<CardContent className="grid grid-cols-12 gap-4">
							<div className="col-span-8">
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>Sản phẩm</CardTitle>
										<CardAction>
											<Button
												type="button"
												variant="ghost"
												onClick={() => {
													cartCollection.delete(cart.map((i) => i.id));
												}}
											>
												Xóa tất cả
											</Button>
										</CardAction>
									</CardHeader>
									<Table className="rounded-md">
										<TableHeader className="bg-neutral-50">
											<TableRow>
												<TableHead className="text-center">
													<Checkbox />
												</TableHead>
												<TableHead className="w-8"></TableHead>
												<TableHead>Tên sản phẩm</TableHead>
												<TableHead></TableHead>
												<TableHead>Số lượng</TableHead>
												<TableHead>Số tiền</TableHead>
												<TableHead></TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{cart.map((item) => (
												<TableRow key={item.id}>
													<TableCell className="text-center">
														<Checkbox defaultChecked={item.selected} />
													</TableCell>
													<TableCell>
														<Avatar className="rounded-md">
															<AvatarImage src={item.thumbnail} />
															<AvatarFallback>CN</AvatarFallback>
														</Avatar>
													</TableCell>
													<TableCell className="w-56 whitespace-normal">
														<Link
															to="/products/$id"
															params={{ id: item.slug }}
															className="hover:underline line-clamp-1"
														>
															{item.name}
														</Link>
													</TableCell>
													<TableCell className="space-x-1">
														{item.combos?.split(",").map((item) => (
															<Badge key={item} variant="secondary">
																{item}
															</Badge>
														))}
													</TableCell>
													<TableCell>
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
													</TableCell>
													<TableCell>
														{formatVND(item.quantity * item.sale_price)}
													</TableCell>
													<TableCell>
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
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</Card>
							</div>
							<div className="col-span-4">
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>Thông tin đặt hàng</CardTitle>
									</CardHeader>
									<CardContent></CardContent>
									<CardFooter>
										<Button
											type="button"
											size="lg"
											className="w-full"
											onClick={handlePayment}
										>
											Tiến hành mua hàng
										</Button>
									</CardFooter>
								</Card>
							</div>
						</CardContent>
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
				</Card>
				<Card className="border-0 shadow-none bg-neutral-50">
					<CardHeader>
						<CardTitle>Sản phẩm gần đây</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-5 gap-4">
						{products.map((item) => (
							<Card
								key={item.id}
								className="border-0 shadow-none bg-neutral-50"
							>
								<Link to="/products/$id" params={{ id: item.slug }}>
									<img src={item.thumbnail} alt="" className="rounded-lg" />
								</Link>
								<CardContent className="px-0">
									<p className="text-sm font-light hover:underline line-clamp-2">
										<Link to="/products/$id" params={{ id: item.slug }}>
											{item.name}
										</Link>
									</p>
								</CardContent>
							</Card>
						))}
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
