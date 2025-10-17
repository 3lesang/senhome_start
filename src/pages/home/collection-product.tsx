import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PercentIcon, ShoppingCartIcon } from "lucide-react";
import { getProductsCollectionQueryOptions } from "@/api/product/list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateDiscount, convertToFileUrl, formatVND } from "@/lib/utils";

interface CollectionProductProps {
	id: string;
}

export function CollectionProduct({ id }: CollectionProductProps) {
	const { data } = useQuery(
		getProductsCollectionQueryOptions({
			collectionId: id,
			page: 1,
			limit: 8,
			sort: "",
		}),
	);
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
			{data?.items.map((item) => (
				<Card key={item.expand.product.id} className="border-0 shadow-none p-0">
					<div className="aspect-square bg-neutral-50 rounded-md relative group">
						<Link to="/products/$id" params={{ id: item.expand.product.slug }}>
							<img
								src={convertToFileUrl(item.expand.product.expand.file[0])}
								alt=""
								className="rounded-lg object-contain group-hover:opacity-0 transition-opacity duration-150 w-full h-full"
							/>
							<img
								src={convertToFileUrl(item.expand.product.expand.file[1])}
								alt=""
								className="rounded-lg object-contain opacity-0 group-hover:opacity-100 absolute inset-0 z-20 transition-opacity duration-150 h-full w-full"
							/>
						</Link>
						<Button
							type="submit"
							size="icon-sm"
							variant="secondary"
							className="absolute right-2 bottom-2 z-30"
						>
							<ShoppingCartIcon />
						</Button>
					</div>
					<CardContent className="px-0 space-y-1">
						<p className="line-clamp-2 text-sm font-light hover:underline">
							<Link
								to="/products/$id"
								params={{ id: item.expand.product.slug }}
							>
								{item.expand.product.name}
							</Link>
						</p>
						<div className="flex items-center space-x-2">
							<Badge variant="secondary">
								{calculateDiscount(
									item.expand.product.price,
									item.expand.product.sale_price,
								)}
								<PercentIcon />
							</Badge>
							<p className="line-through text-xs text-neutral-700">
								{formatVND(item.expand.product.price)}
							</p>
						</div>
						<p className="text-lg font-bold">
							{formatVND(item.expand.product.sale_price)}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
