import { useSuspenseQuery } from "@tanstack/react-query";
import {
	Link,
	useNavigate,
	useParams,
	useSearch,
} from "@tanstack/react-router";
import { PercentIcon, ShoppingCartIcon } from "lucide-react";
import { getCollectionnQueryOptions } from "@/api/collection/one";
import { getProductsCollectionQueryOptions } from "@/api/product/list";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { calculateDiscount, convertToFileUrl, formatVND } from "@/lib/utils";

export function CollectionPage() {
	const navigate = useNavigate();
	const { id } = useParams({ from: "/(app)/collections/$id" });
	const { sort } = useSearch({ from: "/(app)/collections/$id" });

	const { data: collection } = useSuspenseQuery(getCollectionnQueryOptions(id));
	const { data: products } = useSuspenseQuery(
		getProductsCollectionQueryOptions({
			collectionId: collection.id,
			page: 1,
			limit: 10,
			sort: sort,
		}),
	);

	function handleSortChange(value: string) {
		navigate({
			to: "/collections/$id",
			params: { id },
			search: { sort: value },
		});
	}

	return (
		<main className="min-h-[calc(100vh-474px)] py-4">
			<div className="max-w-6xl mx-auto">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<Link to="/">Trang chủ</Link>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{collection.name}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<Card className="border-0 shadow-none px-0">
					<CardHeader className="px-0">
						<CardTitle className="text-2xl font-bold">
							{collection.name}
						</CardTitle>
						<CardAction>
							<Label>
								Sắp xếp theo
								<Select defaultValue={sort} onValueChange={handleSortChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="-product.created">Mới nhất</SelectItem>
										<SelectItem value="product.price">
											Giá thấp đến cao
										</SelectItem>
										<SelectItem value="-product.price">
											Giá cao đến thấp
										</SelectItem>
										<SelectItem value="-product.discount">
											%Giảm giá nhiều
										</SelectItem>
									</SelectContent>
								</Select>
							</Label>
						</CardAction>
					</CardHeader>
					<CardContent className="grid grid-cols-4 gap-4 px-0">
						{products.items.map((item) => (
							<Card
								key={item.expand.product.id}
								className="border-0 shadow-none p-0"
							>
								<div className="aspect-square bg-neutral-50 rounded-md relative group">
									<Link
										to="/products/$id"
										params={{ id: item.expand.product.slug }}
									>
										<img
											src={convertToFileUrl(item.expand.product.expand.file[0])}
											alt=""
											className="rounded-lg object-contain group-hover:opacity-0 transition-opacity duration-150"
										/>
										<img
											src={convertToFileUrl(item.expand.product.expand.file[1])}
											alt=""
											className="rounded-lg object-contain opacity-0 group-hover:opacity-100 absolute inset-0 z-20 transition-opacity duration-150"
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
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
