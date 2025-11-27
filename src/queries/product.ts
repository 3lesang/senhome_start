import { queryOptions } from "@tanstack/react-query";
import axiosClient from "@/axios";
import { PRODUCT_QUERY_KEY } from "@/constants";

type ProductData = {
	id: number;
	name: string;
	slug: string;
	files: string[];
	meta_title: string;
	meta_description: string;
	origin_price: number;
	sale_price: number;
	options: {
		id: number;
		name: string;
		values: { id: number; name: string }[];
	}[];
	variants: {
		id: number;
		file: string;
		origin_price: number;
		sale_price: number;
		options: Record<string, string>;
	}[];
};

export function getProductBySlugQueryOptions(slug: string) {
	return queryOptions({
		queryKey: [PRODUCT_QUERY_KEY, slug],
		queryFn: async () => {
			const res = await axiosClient.get<ProductData>(`/products/slug/${slug}`);
			return res.data;
		},
	});
}

export function getProductContentQueryOptions(slug: string) {
	return queryOptions({
		queryKey: [PRODUCT_QUERY_KEY, "content", slug],
		queryFn: async () => {
			const res = await axiosClient.get<Record<string, any>>(
				`https://bucket.senhome.vn/content/product/${slug}`,
			);
			return res.data;
		},
	});
}

export function getProductsByCollectionIDQueryOptions(collectionID: number) {
	return queryOptions({
		queryKey: [PRODUCT_QUERY_KEY, collectionID],
		queryFn: async () => {
			const res = await axiosClient.get<ProductData[]>(
				`/collections/${collectionID}/products`,
			);
			return res.data;
		},
	});
}

export function getOptionsByProductQueryOptions(productID: string) {
	return queryOptions({
		queryKey: [PRODUCT_QUERY_KEY, productID],
		queryFn: async () => {
			const res = await axiosClient.get(`/products/${productID}/options`);
			return res.data;
		},
	});
}
