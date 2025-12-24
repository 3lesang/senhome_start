import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import { getProductByCategoryQueryOptions } from "@/queries/product";

interface ProductSuggestProps {
	categoryId: number;
	productId: number;
}

export const ProductSuggest = ({
	productId,
	categoryId,
}: ProductSuggestProps) => {
	const getProductByCategoryQuery = useQuery(
		getProductByCategoryQueryOptions(categoryId),
	);
	if (!getProductByCategoryQuery.data?.data?.length) return;

	return (
		<div className="container mx-auto py-16 px-4 lg:px-0">
			<p className="uppercase font-bold text-2xl mb-4">Sản phẩm tương tự</p>
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-0">
				{getProductByCategoryQuery.data.data?.map(
					(p) =>
						p.id !== productId && (
							<ProductCard
								key={p.id}
								data={{
									id: p.id,
									name: p.name,
									slug: p.slug,
									files: p.files,
									originPrice: p.origin_price,
									salePrice: p.sale_price,
									weight: 0,
									long: 0,
									wide: 0,
									high: 0,
									options: p.options,
									variants: p.variants,
								}}
								hasAction={false}
							/>
						),
				)}
			</div>
		</div>
	);
};
