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
	category_id: number;
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

type PaginationResponse<T> = {
	data: T[];
	page: number;
	page_size: number;
	total_items: number;
	total_pages: number;
};

export function getProductByCategoryQueryOptions(categoryId: number) {
	return queryOptions({
		queryKey: [PRODUCT_QUERY_KEY, categoryId],
		queryFn: async () => {
			const res = await axiosClient.get<PaginationResponse<ProductData>>(
				`/products/categories/${categoryId}`,
			);
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

type SearchProductData = {
	id: number;
	name: string;
	slug: string;
	origin_price: number;
	sale_price: number;
	file: string;
};

export function getSearchProductsQueryOptions(query: string) {
	return queryOptions({
		queryKey: [PRODUCT_QUERY_KEY, query],
		queryFn: () => {
			return axiosClient.get<PaginationResponse<SearchProductData>>("/search", {
				params: { keyword: query },
			});
		},
		enabled: !!query,
	});
}
