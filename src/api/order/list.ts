import { queryOptions } from "@tanstack/react-query";
import {
	ORDER_COLLECTION,
	ORDER_ITEM_COLLECTION,
	pocketClient,
} from "@/pocketbase";

export function getOrdersQueryOptions(userId: string) {
	return queryOptions({
		queryKey: [ORDER_COLLECTION, userId],
		queryFn: () => {
			return pocketClient
				.collection<{
					id: string;
					total_price: number;
					final_price: number;
					total_discount: number;
					created: Date;
					customer: { name: string; phone: string; email: string };
					status: "created";
					payment: "cod";
				}>(ORDER_COLLECTION)
				.getList(1, 10, {
					filter: `customer.browser_id="${userId}"`,
					sort: "-created",
				});
		},
		enabled: !!userId,
	});
}

export function getItemsOrderQueryOptions(orderId: string) {
	return queryOptions({
		queryKey: [ORDER_ITEM_COLLECTION, orderId],
		queryFn: () => {
			return pocketClient
				.collection<{
					id: string;
					price: number;
					sale_price: number;
					quantity: number;
					expand: {
						product: {
							id: string;
							name: string;
							slug: string;
							expand: {
								thumbnail: {
									id: string;
									collectionName: string;
									file: string;
								};
							};
						};
						variant: {
							combos: string;
						};
					};
				}>(ORDER_ITEM_COLLECTION)
				.getList(1, 10, {
					filter: `order="${orderId}"`,
					expand: "product.thumbnail,variant",
				});
		},
	});
}
