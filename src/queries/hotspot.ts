import { queryOptions } from "@tanstack/react-query";
import axiosClient from "@/axios";
import { HOTSPOT_QUERY_KEY } from "@/constants";

type HotspotData = {
	id: number;
	file: string;
	spots: {
		id: number;
		x: number;
		y: number;
		product: {
			name: string;
			slug: string;
			origin_price: number;
			sale_price: number;
			file: string;
		};
	}[];
};

export function getHotspotQueryOptions(productID: number) {
	return queryOptions({
		queryKey: [HOTSPOT_QUERY_KEY, productID],
		queryFn: async () => {
			const res = await axiosClient.get<HotspotData[]>(
				`/hotspots/products/${productID}`,
			);
			return res.data;
		},
	});
}
