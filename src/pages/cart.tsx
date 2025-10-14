import { useLiveQuery } from "@tanstack/react-db";
import { Link, useNavigate } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
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
import { Button } from "@/components/ui/button";
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
import { formatVND } from "@/lib/utils";
import { cartCollection, orderCollection } from "@/stores/db";

export function CartPage() {
	const navigate = useNavigate();

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

	function handlePayment() {
		const addOrder = createClientOnlyFn(() => {
			const existId = localStorage.getItem("browser_id");
			if (existId) {
				return orderCollection.update(existId, (order) => {
					order.items = cart;
				});
			}
			const id = crypto.randomUUID();
			localStorage.setItem("browser_id", id);
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
		});
		addOrder();
		navigate({ to: "/checkout" });
	}

	return (
		<main className="bg-neutral-50 h-[calc(100vh-352px)] py-4">
			<div className="max-w-6xl mx-auto">
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
				<Card className="bg-neutral-50 border-0 shadow-none">
					<CardHeader className="p-0">
						<CardTitle>Giỏ hàng của bạn</CardTitle>
					</CardHeader>
					<Activity mode={cart.length > 0 ? "visible" : "hidden"}>
						<CardContent className="grid grid-cols-12 gap-4 p-0">
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
									<CardContent className="p-0">
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
									</CardContent>
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
											Thanh toán
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
								<EmptyTitle>Giỏ hàng trống</EmptyTitle>
								<EmptyDescription>Chưa có sản phẩm</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<Button>Mua sắm</Button>
							</EmptyContent>
						</Empty>
					</Activity>
				</Card>
				<Card className="border-0 shadow-none bg-neutral-50">
					<CardHeader className="p-0">
						<CardTitle>Sản phẩm gần đây</CardTitle>
					</CardHeader>
					<CardContent className="p-0"></CardContent>
				</Card>
			</div>
		</main>
	);
}
