import { createFileRoute } from "@tanstack/react-router";
import { getItemsOrder } from "@/api/order/list";
import { getOrder } from "@/api/order/one";
import { OneOrderPage } from "@/pages/order/one";

export const Route = createFileRoute("/(second)/order/$id")({
	ssr: false,
	component: OneOrderPage,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(getItemsOrder(params.id));
		return context.queryClient.ensureQueryData(getOrder(params.id));
	},
});
