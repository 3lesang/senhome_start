import { queryOptions } from "@tanstack/react-query";
import axiosClient from "@/axios";
import { STORE_QUERY_KEY } from "@/constants";

type StoreData = {
	name: string;
	description: string;
	phone: string;
	email: string;
	address: string;
	zalo: string;
	hotline: string;
	logo: string;
	certificates: { id: string; url: string; file_url: string }[];
	social: {
		facebook: string;
		youtube: string;
		instagram: string;
		tiktok: string;
	};
};

export function getStoreQueryOptions() {
	return queryOptions({
		queryKey: [STORE_QUERY_KEY],
		queryFn: async () => {
			const res = await axiosClient.get<StoreData>(
				"https://bucket.senhome.vn/store",
			);
			return res.data;
		},
	});
}
