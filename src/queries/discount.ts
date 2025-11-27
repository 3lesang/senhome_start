import { queryOptions } from "@tanstack/react-query";
import axiosClient from "@/axios";
import { DISCOUNT_QUERY_KEY } from "@/constants";

type DiscountEffect = {
	applies_to: string;
	effect_type: string;
	value: string;
};

type DiscountCondition = {
	condition_type: string;
	value: string;
};

type DiscountData = {
	id: number;
	code: string;
	title: string;
	description: string;
	discount_type: string;
	per_customer_limit: number;
	effects: DiscountEffect[];
	conditions: DiscountCondition[];
};

export function getDiscountsQueryOptions() {
	return queryOptions({
		queryKey: [DISCOUNT_QUERY_KEY],
		queryFn: async () => {
			const res = await axiosClient.get<DiscountData[]>("/discounts/public");
			return res.data;
		},
	});
}
