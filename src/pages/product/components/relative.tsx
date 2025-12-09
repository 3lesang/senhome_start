import { useQuery } from "@tanstack/react-query";
import { convertToFileUrl, formatVND } from "@/lib/utils";
import { getHotspotQueryOptions } from "@/queries/hotspot";
import { PlusIcon } from "lucide-react";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";

interface RelativeProductsProps {
	productID: number;
}
export function RelativeProducts({ productID }: RelativeProductsProps) {
	const getProductsQuery = useQuery(getHotspotQueryOptions(productID));

	if (!getProductsQuery.data?.length) return null;
	return (
		<div className="max-w-[1800px] grid grid-cols-1 lg:grid-cols-3 mx-auto py-16">
			{getProductsQuery.data?.map((item) => (
				<div
					key={item.id}
					className="relative aspect-square bg-neutral-50"
				>
					<img
						src={convertToFileUrl(item?.file)}
						alt=""
						className="object-contain w-full h-full"
					/>
					{item.spots.map((spot) => (
						<div
							key={spot.id}
							className="absolute"
							style={{ left: spot.x + "%", top: spot.y + "%" }}
						>
							<HoverCard>
								<HoverCardTrigger>
									<button
										type="button"
										className="flex items-center justify-center bg-blue-500 rounded-full cursor-pointer"
									>
										<PlusIcon className="text-white size-4" />
									</button>
								</HoverCardTrigger>
								<HoverCardContent>
									<Item>
										<ItemMedia>
											<Avatar>
												<AvatarImage
													src={convertToFileUrl(spot.product.file)}
												/>
											</Avatar>
										</ItemMedia>
										<ItemContent>
											<ItemTitle>
												<Link
													to="/products/$id"
													params={{ id: spot.product.slug }}
												>
													<p className="hover:underline">{spot.product.name}</p>
												</Link>
											</ItemTitle>
											<ItemDescription>
												<p>{formatVND(spot.product.sale_price)}</p>
											</ItemDescription>
										</ItemContent>
									</Item>
								</HoverCardContent>
							</HoverCard>
						</div>
					))}
				</div>
			))}
		</div>
	);
}
