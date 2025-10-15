import { queryOptions } from "@tanstack/react-query";
import pocketClient, { COLLECTION_PRODUCT_COLLECTION } from "@/pocketbase";

export function getProductsCollectionQueryOptions(collectionId: string) {
	return queryOptions({
		queryKey: [COLLECTION_PRODUCT_COLLECTION, collectionId],
		queryFn: () => {
			return pocketClient
				.collection<{
					expand: {
						product: {
							id: string;
							name: string;
							slug: string;
							price: number;
							sale_price: number;
							expand: {
								thumbnail: { id: string; collectionName: string; file: string };
							};
						};
					};
				}>(COLLECTION_PRODUCT_COLLECTION)
				.getList(1, 8, {
					filter: `collection="${collectionId}"`,
					expand: "product.thumbnail",
				});
		},
	});
}
