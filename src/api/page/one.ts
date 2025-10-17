import { queryOptions } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/core";
import { pocketClient, STORE_PAGE_COLLECTION } from "@/pocketbase";

export function getPageQueryOptions(slug: string) {
	return queryOptions({
		queryKey: [STORE_PAGE_COLLECTION, slug],
		queryFn: () => {
			return pocketClient
				.collection<{ id: string; title: string; content: JSONContent }>(
					STORE_PAGE_COLLECTION,
				)
				.getFirstListItem(`slug="${slug}"`);
		},
	});
}
