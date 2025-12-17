import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import axiosClient from "@/axios";
import { POST_QUERY_KEY } from "@/constants";

type ListPostData = {
  id: number;
  title: string;
  slug: string;
  file: string;
  meta_title: string;
  meta_description: string
  created_at: Date
}

type PaginationResponse<T> = {
  data: T[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export function getPostsQueryOptions(params: { page: number, limit: number }) {
  return queryOptions({
    queryKey: [POST_QUERY_KEY, params.page, params.limit],
    queryFn: async () => {
      const res = await axiosClient.get<PaginationResponse<ListPostData>>("/posts/public", { params })
      return res.data
    }
  })
}

type PostData = {
  id: number;
  title: string;
  slug: string;
  file: string;
  meta_title: string;
  meta_description: string
  created_at: Date
}

export function getPostQueryOptions(postId: string) {
  return queryOptions({
    queryKey: [POST_QUERY_KEY, postId],
    queryFn: async () => {
      const res = await axiosClient.get<PostData>(`/posts/slug/${postId}`)
      return res.data
    }
  })
}

export function getPostContentQueryOptions(postSlug: string) {
  return queryOptions({
    queryKey: ["post-content", postSlug],
    queryFn: async () => {
      const res = await axios.get(`https://bucket.senhome.vn/post/content/${postSlug}`);
      return res.data;
    },
  });
}
