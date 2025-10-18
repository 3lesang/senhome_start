import { queryOptions } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { PRODUCT_COLLECTION, pocketClient } from "@/pocketbase";

export function getProductQueryOptions(id: string) {
	return queryOptions({
		queryKey: [PRODUCT_COLLECTION, id],
		queryFn: () => {
			return pocketClient
				.collection<{
					id: string;
					name: string;
					slug: string;
					content: JSONContent;
					price: number;
					sale_price: number;
					seo: { title: string; description: string };
					expand: {
						file: { id: string; collectionName: string; file: string }[];
					};
				}>(PRODUCT_COLLECTION)
				.getFirstListItem(`slug="${id}"`, {
					expand: "file",
				});
		},
	});
}
