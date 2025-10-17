import { queryOptions } from "@tanstack/react-query";
import { COLLECTION_COLLECTION, pocketClient } from "@/pocketbase";

export function getCollectionnQueryOptions(collectionId: string) {
	return queryOptions({
		queryKey: [COLLECTION_COLLECTION, collectionId],
		queryFn: () => {
			return pocketClient
				.collection<{
					id: string;
					name: string;
					content: string;
					slug: string;
				}>(COLLECTION_COLLECTION)
				.getFirstListItem(`slug="${collectionId}"`);
		},
	});
}
