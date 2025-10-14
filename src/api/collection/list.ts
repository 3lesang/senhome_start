import { queryOptions } from "@tanstack/react-query";
import pocketClient, {
	COLLECTION_COLLECTION,
	COLLECTION_PRODUCT_COLLECTION,
	PRODUCT_OPTION_COLLECTION,
	PRODUCT_OPTION_VALUE_COLLECTION,
} from "@/pocketbase";

type CollectionHeroDataType = {
	id: string;
	name: string;
	slug: string;
	expand: {
		file: { id: string; collectionName: string; file: string };
	};
};

export function getCollectionsHeroQueryOptions() {
	return queryOptions({
		queryKey: [COLLECTION_COLLECTION],
		queryFn: () => {
			return pocketClient
				.collection<CollectionHeroDataType>(COLLECTION_COLLECTION)
				.getFullList({
					fields: "id,name,slug,expand",
					expand: "file",
					filter: `layout="hero"`,
				});
		},
	});
}

type ProductDataType = {
	id: string;
	name: string;
	slug: string;
	price: number;
	sale_price: number;
	expand: { thumbnail: { id: string; collectionName: string; file: string } };
	options: {
		id: string;
		name: string;
		values: { id: string; name: string }[];
	}[];
};

type CollectionHomeDataType = {
	id: string;
	name: string;
	slug: string;
	expand: {
		file: { id: string; collectionName: string; file: string };
	};
	products: ProductDataType[];
};

type CollectionProductDataType = {
	expand: {
		product: ProductDataType;
	};
};

export function getCollectionsHomeQueryOptions() {
	return queryOptions({
		queryKey: [COLLECTION_COLLECTION, "home"],
		queryFn: async () => {
			const res = await pocketClient
				.collection<CollectionHomeDataType>(COLLECTION_COLLECTION)
				.getFullList({
					expand: "file",
					filter: `layout="home"`,
				});

			for (const collection of res) {
				const productsRes = await pocketClient
					.collection<CollectionProductDataType>(COLLECTION_PRODUCT_COLLECTION)
					.getList(1, 5, {
						expand: "product.thumbnail",
						filter: `collection="${collection.id}"`,
					});

				const products: ProductDataType[] = productsRes.items.map((i) => ({
					id: i.expand.product.id,
					name: i.expand.product.name,
					slug: i.expand.product.slug,
					price: i.expand.product.price,
					sale_price: i.expand.product.sale_price,
					expand: i.expand.product.expand,
					options: [],
				}));

				for (const product of products) {
					const options = await pocketClient
						.collection<{
							id: string;
							name: string;
							values: { id: string; name: string }[];
						}>(PRODUCT_OPTION_COLLECTION)
						.getFullList({ filter: `product="${product.id}"` });

					for (const option of options) {
						const values = await pocketClient
							.collection<{ id: string; name: string }>(
								PRODUCT_OPTION_VALUE_COLLECTION,
							)
							.getFullList({ filter: `option="${option.id}"` });
						option.values = values;
					}
					product.options = options;
				}
				collection.products = products;
			}
			return res;
		},
	});
}
