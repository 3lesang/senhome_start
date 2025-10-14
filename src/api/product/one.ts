import { queryOptions } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import pocketClient, { PRODUCT_COLLECTION } from "@/pocketbase";

type ProductDataType = {
	id: string;
	name: string;
	slug: string;
	content: JSONContent;
	price: number;
	sale_price: number;
	expand: { file: { id: string; collectionName: string; file: string }[] };
};

export function getProductQueryOptions(id: string) {
	return queryOptions({
		queryKey: [PRODUCT_COLLECTION, id],
		queryFn: () => {
			return pocketClient
				.collection<ProductDataType>(PRODUCT_COLLECTION)
				.getFirstListItem(`slug="${id}"`, {
					expand: "file",
				});
		},
	});
}
