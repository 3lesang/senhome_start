import { queryOptions } from "@tanstack/react-query";
import pocketClient, { PRODUCT_VARIANT_COLLECTION } from "@/pocketbase";

type VariantDataType = {
	id: string;
	price: number;
	sale_price: number;
	expand: {
		file: { id: string; collectionName: string; file: string };
	};
	combos: string;
};

export function getVariantsProduct(productId: string) {
	return queryOptions({
		queryKey: [PRODUCT_VARIANT_COLLECTION],
		queryFn: () => {
			return pocketClient
				.collection<VariantDataType>(PRODUCT_VARIANT_COLLECTION)
				.getFullList({
					filter: `product="${productId}"`,
					expand: "file",
					sort: "price",
				});
		},
	});
}
