import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getCollectionQueryOptions } from "@/queries/collection";
import { getProductsByCollectionIDQueryOptions } from "@/queries/product";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

export function CollectionPage() {
	const { id } = useParams({ from: "/(app)/collection/$id" });
	const getCollectionQuery = useSuspenseQuery(getCollectionQueryOptions(id));
	const getProductsQuery = useSuspenseQuery(
		getProductsByCollectionIDQueryOptions(getCollectionQuery.data.id),
	);

	return (
		<main>
			<div className="container mx-auto py-8 px-4">
				<div className="lg:flex justify-between items-center mb-8">
					<p className="text-2xl font-bold">{getCollectionQuery.data.name}</p>
					<div className="flex gap-2 overflow-auto">
						<Button type="button" variant="secondary" className="rounded-full">
							Mới nhất
						</Button>
						<Button type="button" variant="secondary" className="rounded-full">
							Giá thấp đến cao
						</Button>
						<Button type="button" variant="secondary" className="rounded-full">
							Giá cao đến thấp
						</Button>
						<Button type="button" variant="secondary" className="rounded-full">
							%Giảm giá nhiều
						</Button>
					</div>
				</div>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-0">
					{getProductsQuery.data?.map((p) => (
						<ProductCard
							key={p.id}
							data={{
								id: p.id,
								name: p.name,
								slug: p.slug,
								files: p.files,
								originPrice: p.origin_price,
								salePrice: p.sale_price,
								options: p.options,
								variants: p.variants,
							}}
						/>
					))}
				</div>
			</div>
		</main>
	);
}
