import { queryOptions } from "@tanstack/react-query";
import pocketClient, {
	PRODUCT_OPTION_COLLECTION,
	PRODUCT_OPTION_VALUE_COLLECTION,
} from "@/pocketbase";

export function getOptionsProduct(productId: string) {
	return queryOptions({
		queryKey: [PRODUCT_OPTION_COLLECTION, productId],
		queryFn: async () => {
			const options = await pocketClient
				.collection<{
					id: string;
					name: string;
					values: { id: string; name: string }[];
				}>(PRODUCT_OPTION_COLLECTION)
				.getFullList({ filter: `product="${productId}"` });

			for (const option of options) {
				const values = await pocketClient
					.collection<{ id: string; name: string }>(
						PRODUCT_OPTION_VALUE_COLLECTION,
					)
					.getFullList({
						filter: `option="${option.id}"`,
					});
				option.values = values;
			}
			return options;
		},
	});
}
