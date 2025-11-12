import axiosClient from "@/axios";
import { STORE_QUERY_KEY } from "@/constants";
import { queryOptions } from "@tanstack/react-query";

type StoreData = {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
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
