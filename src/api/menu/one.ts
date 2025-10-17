import { queryOptions } from "@tanstack/react-query";
import { MENU_COLLECTION, pocketClient } from "@/pocketbase";

export function getOneMenuQueryOptions() {
	return queryOptions({
		queryKey: [MENU_COLLECTION],
		queryFn: () => {
			return pocketClient
				.collection<{
					id: string;
					items: { id: string; title: string; url: string }[];
				}>(MENU_COLLECTION)
				.getFirstListItem(`position="footer"`);
		},
	});
}
