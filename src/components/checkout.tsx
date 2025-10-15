import { eq, useLiveQuery } from "@tanstack/react-db";
import { createClientOnlyFn } from "@tanstack/react-start";
import { checkBrowserId } from "@/lib/utils";
import { orderCollection } from "@/stores/db";

const getOrder = createClientOnlyFn(() => {
	const { data: order } = useLiveQuery((q) =>
		q
			.from({ order: orderCollection })
			.where(({ order }) => eq(order.id, checkBrowserId()))
			.findOne(),
	);
	return order;
});

export function CheckoutButton() {
	getOrder();
	return null;
}
