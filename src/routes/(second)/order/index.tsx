import { createFileRoute } from "@tanstack/react-router";
import { getOrdersQueryOptions } from "@/api/order/list";
import { checkBrowserId } from "@/lib/utils";
import { ListOrderPage } from "@/pages/order/list";

export const Route = createFileRoute("/(second)/order/")({
	ssr: false,
	component: ListOrderPage,
	loader: ({ context }) => {
		return context.queryClient.ensureQueryData(
			getOrdersQueryOptions(checkBrowserId()),
		);
	},
});
