import { queryOptions } from "@tanstack/react-query";
import { PRODUCT_REVIEW_COLLECTION, pocketClient } from "@/pocketbase";

export function getReviewsProductQueryOptions(productId: string) {
	return queryOptions({
		queryKey: [PRODUCT_REVIEW_COLLECTION, productId],
		queryFn: () => {
			return pocketClient
				.collection<{
					id: string;
					rating: number;
					content: string;
					expand: {
						user: {
							name: string;
							expand: {
								avatar: { id: string; collectionName: string; file: string };
							};
						};
					};
				}>(PRODUCT_REVIEW_COLLECTION)
				.getList(1, 10, {
					filter: `product="${productId}"`,
					expand: "user.avatar",
				});
		},
	});
}
