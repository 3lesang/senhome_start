import { queryOptions } from "@tanstack/react-query";
import axiosClient from "@/axios";

type CustomerData = {
	id: number;
	name: string;
	email: string;
	phone: string;
};

export function getMeQueryOptions() {
	return queryOptions({
		queryKey: ["me"],
		queryFn: async () => {
			const res = await axiosClient.get<CustomerData>("/customers/me");
			return res.data;
		},
	});
}
