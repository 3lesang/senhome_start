import { queryOptions } from "@tanstack/react-query";
import axiosClient from "@/axios";
import { COLLECTION_QUERY_KEY } from "@/constants";

type HeroCollectionData = {
  id: number;
  file: string;
  slug: string;
};

export const getHeroCollectionsQueryOptions = queryOptions({
  queryKey: [COLLECTION_QUERY_KEY, "hero"],
  queryFn: async () => {
    const res =
      await axiosClient.get<HeroCollectionData[]>("/collections/hero");
    return res.data;
  },
});

type HomeCollectionData = {
  id: number;
  name: string;
  file: string;
  slug: string;
  products: {
    id: number;
    name: string;
    slug: string;
    origin_price: number;
    sale_price: number;
    files: string[];
    variants: {
      origin_price: number;
      sale_price: number;
      options: Record<string, string>;
    }[];
  }[];
};

export const getHomeCollectionsQueryOptions = queryOptions({
  queryKey: [COLLECTION_QUERY_KEY, "home"],
  queryFn: async () => {
    const res =
      await axiosClient.get<HomeCollectionData[]>("/collections/home");
    return res.data;
  },
});

type CollectionData = {
  id: number;
  file: string;
  name: string;
  meta_title: string;
  meta_description: string;
};

export function getCollectionQueryOptions(slug: string) {
  return queryOptions({
    queryKey: [COLLECTION_QUERY_KEY, slug],
    queryFn: async () => {
      const res = await axiosClient.get<CollectionData>(
        `/collections/slug/${slug}`,
      );
      return res.data;
    },
  });
}
