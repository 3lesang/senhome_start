import { queryOptions } from "@tanstack/react-query";
import axiosClient from "@/axios";
import { PRODUCT_REVIEW_QUERY_KEY } from "@/constants";

type ReviewData = {
  id: number;
  rating: number;
  comment: string;
  files: string[];
  customer: {
    id: number;
    name: string;
    avatar: string;
  };
};

type PaginationResponse<T> = {
  data: T[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export function getReviewsByProductQueryOptions(
  productID: number,
  params?: {
    sort_flag?: number;
    has_image?: boolean;
    rating?: number;
  },
) {
  return queryOptions({
    queryKey: [PRODUCT_REVIEW_QUERY_KEY, productID, JSON.stringify(params)],
    queryFn: async () => {
      const res = await axiosClient.get<PaginationResponse<ReviewData>>(
        `/reviews/products/${productID}`,
        {
          params,
        },
      );
      return res.data;
    },
  });
}

type OverviewData = {
  average_rating: number;
  total_reviews: number;
  total_files: number;
  files: string[];
};

export function getOverviewByProductQueryOptions(productID: number) {
  return queryOptions({
    queryKey: ["overview_review", productID],
    queryFn: async () => {
      const res = await axiosClient.get<OverviewData>(
        `/reviews/products/${productID}/overview`,
      );
      return res.data;
    },
  });
}
