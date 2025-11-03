import axiosClient from "@/axios";
import { ORDER_QUERY_KEY } from "@/constants";
import { queryOptions } from "@tanstack/react-query";

export function checkOrderCreatedQueryOptions(orderID: number) {
  return queryOptions({
    queryKey: [ORDER_QUERY_KEY, "success", orderID],
    queryFn: async () => {
      const res = await axiosClient.get<{ id: number }>(
        `/orders/${orderID}/success`,
      );
      return res.data;
    },
  });
}
