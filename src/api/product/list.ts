import { queryOptions } from "@tanstack/react-query";
import { COLLECTION_PRODUCT_COLLECTION, pocketClient } from "@/pocketbase";

export function getProductsCollectionQueryOptions({
	collectionId,
	page,
	limit,
	sort,
}: {
	collectionId: string;
	page: number;
	limit: number;
	sort: string;
}) {
	return queryOptions({
		queryKey: [COLLECTION_PRODUCT_COLLECTION, collectionId, sort],
		queryFn: () => {
			return pocketClient
				.collection<{
					id: string;
					expand: {
						product: {
							id: string;
							name: string;
							slug: string;
							price: number;
							sale_price: number;
							expand: {
								file: { id: string; collectionName: string; file: string }[];
							};
						};
					};
				}>(COLLECTION_PRODUCT_COLLECTION)
				.getList(page, limit, {
					filter: `collection="${collectionId}"`,
					expand: "product.file",
					sort,
				});
		},
	});
}
