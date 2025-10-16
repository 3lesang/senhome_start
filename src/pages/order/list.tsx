import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import * as timeago from "timeago.js";
import vi from "timeago.js/lib/lang/vi";
import TimeAgo from "timeago-react";
import { getOrders } from "@/api/order/list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { checkBrowserId, formatVND } from "@/lib/utils";

timeago.register("vi", vi);

export function getOrderStatus(key: "created") {
	const STATUS = {
		created: "Đã tạo",
	};
	return STATUS[key];
}

export function getOrderPayment(key: "cod") {
	const PAYMENT = {
		cod: "Thanh toán khi nhận hàng",
	};
	return PAYMENT[key];
}

export function ListOrderPage() {
	const { data } = useSuspenseQuery(getOrders(checkBrowserId()));
	return (
		<main className="bg-neutral-50 h-[calc(100vh-64px)]">
			<div className="max-w-4xl mx-auto py-8">
				<Card className="bg-transparent border-0 shadow-none">
					<CardHeader>
						<CardTitle>Lịch sử đơn hàng</CardTitle>
					</CardHeader>
					<CardContent>
						<Card className="border-0 shadow-none">
							<CardHeader>
								<CardDescription>
									<Badge variant="secondary">{data.totalItems} đơn hàng</Badge>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								{data?.items.map((item) => (
									<Item key={item.id} variant="muted" asChild>
										<Link to="/order/$id" params={{ id: item.id }}>
											<ItemHeader>
												<Badge>{getOrderStatus(item.status)}</Badge>
											</ItemHeader>
											<ItemContent>
												<ItemTitle className="font-bold">
													{formatVND(item.final_price)}
												</ItemTitle>
												<ItemDescription className="space-x-2">
													<span>{getOrderPayment(item.payment)}</span>
												</ItemDescription>
											</ItemContent>
											<ItemActions>
												<TimeAgo datetime={item.created} locale="vi" />
												<Button type="button" variant="ghost" size="icon">
													<ChevronRightIcon />
												</Button>
											</ItemActions>
										</Link>
									</Item>
								))}
							</CardContent>
						</Card>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
