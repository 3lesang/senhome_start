import { sum, useLiveQuery } from "@tanstack/react-db";
import { createClientOnlyFn } from "@tanstack/react-start";
import { cartCollection } from "@/stores/db";
import { Badge } from "./ui/badge";

const getQuantity = createClientOnlyFn(() => {
	const { data } = useLiveQuery((q) =>
		q
			.from({ cart: cartCollection })
			.findOne()
			.select(({ cart }) => ({ total: sum(cart.quantity) })),
	);
	return data?.total ?? 0;
});

export function CartBadge() {
	const total = getQuantity();
	if (total === 0) return null;
	return (
		<Badge variant="secondary" className="absolute -bottom-2 -right-2 z-10 rounded-full">
			{total}
		</Badge>
	);
}
