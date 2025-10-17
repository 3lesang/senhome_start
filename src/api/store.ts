import { queryOptions } from "@tanstack/react-query";
import { pocketClient, STORE_COLLECTION } from "@/pocketbase";

export function getStoreQueryOptions() {
	return queryOptions({
		queryKey: [STORE_COLLECTION],
		queryFn: () => {
			return pocketClient
				.collection<{
					id: string;
					name: string;
					phone: string;
					email: string;
					content: string;
					address: {
						street: string;
						province: { label: string };
						district: { label: string };
						ward: { label: string };
					};
				}>(STORE_COLLECTION)
				.getOne("g04f6768au3k495");
		},
	});
}
