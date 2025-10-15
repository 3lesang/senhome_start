import { eq, useLiveQuery } from "@tanstack/react-db";
import { createClientOnlyFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { recentProductsCollection } from "@/stores/db";

type Product = {
	id: string;
	name: string;
	slug: string;
	price: number;
	sale_price: number;
	thumbnail: string;
};
interface RecentProductsProps {
	data: Product;
}

const getProduct = createClientOnlyFn((id: string) => {
	const { data: product } = useLiveQuery((q) =>
		q
			.from({ product: recentProductsCollection })
			.where(({ product }) => eq(product.id, id))
			.findOne(),
	);
	return product;
});

const insertProduct = createClientOnlyFn((product: Product) => {
	recentProductsCollection.insert({
		id: product.id,
		name: product.name,
		slug: product.slug,
		price: product.price,
		sale_price: product.sale_price,
		thumbnail: product.thumbnail,
	});
});

export function RecentProducts({ data }: RecentProductsProps) {
	const product = getProduct(data.id);
	useEffect(() => {
		if (!product?.id) insertProduct(data);
	}, [product?.id, data]);
	return null;
}
