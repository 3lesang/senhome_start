import { createFileRoute } from "@tanstack/react-router";
import { getItemsOrderQueryOptions } from "@/api/order/list";
import { getOrderQueryOptions } from "@/api/order/one";
import { OneOrderPage } from "@/pages/order/one";

export const Route = createFileRoute("/(app)/order/$id")({
	ssr: false,
	component: OneOrderPage,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getItemsOrderQueryOptions(params.id),
		)
		return context.queryClient.ensureQueryData(getOrderQueryOptions(params.id));
	},
});
