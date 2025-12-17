import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import axiosClient from "@/axios";
import { STORE_PAGE_QUERY_KEY } from "@/constants";

type PageData = {
  id: number;
  name: string;
  slug: string;
};

export function getPageQueryOptions(slug: string) {
  return queryOptions({
    queryKey: [STORE_PAGE_QUERY_KEY, slug],
    queryFn: async () => {
      const res = await axiosClient.get<PageData>(`/pages/slug/${slug}`);
      return res.data;
    },
  });
}

export function getPageContentQueryOptions(id: number) {
  return queryOptions({
    queryKey: ["content", id],
    queryFn: async () => {
      const res = await axios.get(`https://bucket.senhome.vn/page/${id}`);
      return res.data;
    },
  });
}
