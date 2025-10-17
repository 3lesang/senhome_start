import { queryOptions } from "@tanstack/react-query";
import { PRODUCT_VARIANT_COLLECTION, pocketClient } from "@/pocketbase";

export function getVariantsProduct(productId: string) {
	return queryOptions({
		queryKey: [PRODUCT_VARIANT_COLLECTION, productId],
		queryFn: () => {
			return pocketClient
				.collection<{
					id: string;
					price: number;
					sale_price: number;
					expand: {
						file: { id: string; collectionName: string; file: string };
					};
					combos: string;
				}>(PRODUCT_VARIANT_COLLECTION)
				.getFullList({
					filter: `product="${productId}"`,
					expand: "file",
					sort: "price",
				});
		},
	});
}
