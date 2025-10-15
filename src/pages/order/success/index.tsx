import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckIcon, ServerCrashIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import pocketClient, { ORDER_COLLECTION } from "@/pocketbase";

export function OrderSuccessPage() {
	const { id } = useSearch({ from: "/(blank)/order/success" });
	const { data, isLoading } = useQuery({
		queryKey: [ORDER_COLLECTION, id],
		queryFn: () => {
			return pocketClient
				.collection<{ id: string; price: number; sale_price: number }>(
					ORDER_COLLECTION,
				)
				.getOne(id);
		},
		enabled: !!id,
	});
	if (isLoading)
		return (
			<main className="h-screen bg-neutral-50 flex justify-center items-center">
				<Spinner />
			</main>
		);
	if (!data?.id && !isLoading)
		return (
			<main>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ServerCrashIcon />
						</EmptyMedia>
						<EmptyTitle>No data</EmptyTitle>
						<EmptyDescription>No data found</EmptyDescription>
					</EmptyHeader>
					<EmptyContent></EmptyContent>
				</Empty>
			</main>
		);

	return (
		<main className="bg-neutral-50 h-screen">
			<div className="max-w-4xl mx-auto py-16">
				<Item variant="muted">
					<ItemMedia>
						<CheckIcon />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>Tạo đơn hàng thành công</ItemTitle>
						<ItemDescription>
							Vui lòng kiểm tra email hoặc số điện thoại để cập nhật thông tin
							đơn hàng
						</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Link to="/order" className={cn(buttonVariants())}>
							Đơn hàng của tôi
						</Link>
					</ItemActions>
				</Item>
			</div>
		</main>
	);
}
