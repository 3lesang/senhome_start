import { queryOptions } from "@tanstack/react-query";
import pocketClient, { PRODUCT_COLLECTION } from "@/pocketbase";

export function getProductsQueryOptions() {
	return queryOptions({
		queryKey: [PRODUCT_COLLECTION],
		queryFn: () => {
			return pocketClient.collection(PRODUCT_COLLECTION).getList(1, 10);
		},
	});
}
