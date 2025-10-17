import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { MailIcon, PhoneIcon } from "lucide-react";
import { getItemsOrderQueryOptions } from "@/api/order/list";
import { getOrderQueryOptions } from "@/api/order/one";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { convertToFileUrl, formatVND } from "@/lib/utils";
import { getOrderStatus } from "./list";

export function OneOrderPage() {
	const { id } = useParams({ from: "/(second)/order/$id" });
	const { data: order } = useSuspenseQuery(getOrderQueryOptions(id));
	const { data: items } = useSuspenseQuery(getItemsOrderQueryOptions(order.id));

	return (
		<main className="bg-neutral-50">
			<div className="max-w-4xl mx-auto py-8 px-4">
				<Card className="bg-transparent border-0 shadow-none px-0">
					<CardHeader className="px-0">
						<CardTitle>{order.id}</CardTitle>
						<CardDescription>
							<Badge>{getOrderStatus(order.status)}</Badge>
						</CardDescription>
						<CardAction>
							<Button type="button" variant="secondary">
								Liên hệ Senhome
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-0">
						<Card className="lg:col-span-12 border-0 shadow-none">
							<CardHeader>
								<CardTitle>Thông tin vận chuyển</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Item variant="muted">
									<ItemHeader>Thông tin người nhận</ItemHeader>
									<ItemContent>
										<ItemTitle>{order.customer.name}</ItemTitle>
										<ItemDescription className="space-x-2">
											<PhoneIcon className="size-4 inline" />
											<span>{order.customer.phome}</span>
											<MailIcon className="size-4 inline" />
											<span>{order.customer.email}</span>
										</ItemDescription>
									</ItemContent>
								</Item>
								<Item variant="muted">
									<ItemHeader>Địa chỉ</ItemHeader>
									<ItemContent>
										<ItemTitle>
											{order.customer.address.street},
											{order.customer.address.ward.label},
											{order.customer.address.district.label},
											{order.customer.address.province.label}
										</ItemTitle>
									</ItemContent>
								</Item>
							</CardContent>
						</Card>
						<Card className="border-0 shadow-none lg:col-span-8">
							<CardHeader>
								<CardTitle>Sản phẩm</CardTitle>
								<CardDescription>
									<Badge variant="secondary">{items.totalItems} sản phẩm</Badge>
								</CardDescription>
							</CardHeader>
							<ScrollArea className="h-56">
								<CardContent className="space-y-2">
									{items.items.map((item) => (
										<Item key={item.id} variant="muted">
											<ItemMedia>
												<Avatar className="rounded">
													<AvatarImage
														src={convertToFileUrl(
															item.expand.product.expand.thumbnail,
														)}
													/>
													<AvatarFallback>CN</AvatarFallback>
												</Avatar>
											</ItemMedia>
											<ItemContent>
												<ItemTitle>
													<Link
														to="/products/$id"
														params={{ id: item.expand.product.slug }}
														className="hover:underline"
													>
														{item.expand.product.name}
													</Link>
												</ItemTitle>
												<ItemDescription className="space-x-2">
													{item.expand.variant.combos.split(",").map((item) => (
														<Badge key={item} variant="secondary">
															{item}
														</Badge>
													))}
													<Badge>Số lượng {item.quantity}</Badge>
													<span>{formatVND(item.sale_price)}</span>
												</ItemDescription>
											</ItemContent>
											<ItemActions>
												<Button type="button" variant="outline">
													Đánh giá
												</Button>
											</ItemActions>
										</Item>
									))}
								</CardContent>
							</ScrollArea>
						</Card>
						<Card className="border-0 shadow-none lg:col-span-4 h-fit">
							<CardHeader>
								<CardTitle>Thông tin đơn hàng</CardTitle>
							</CardHeader>
							<CardContent className="text-neutral-600 text-sm space-y-2">
								<div className="flex justify-between mb-4">
									<p>Tạm tính</p>
									<p>{formatVND(order.total_price)}</p>
								</div>
								<div className="flex justify-between">
									<p>Giảm giá</p>
									<p>{formatVND(order.total_discount)}</p>
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
									{formatVND(order.final_price)}
								</p>
							</CardFooter>
						</Card>
					</CardContent>
					<CardFooter className="px-0">
						<Button className="ml-auto">Mua lại</Button>
					</CardFooter>
				</Card>
			</div>
		</main>
	);
}
