import { Rating, RatingButton } from "@/components/kibo-ui/rating";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatVND } from "@/lib/utils";

type InfoData = {
	name: string;
	averageRating: number;
	totalReviews: number;
	salePrice: number;
	discount: number;
	originPrice: number;
};

interface ProductInfoProps {
	data: InfoData;
	onReviewClick?: () => void;
}

export function ProductInfo({ data, onReviewClick }: ProductInfoProps) {
	return (
		<div>
			<p className="text-2xl font-semibold mb-2">{data.name}</p>
			{/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
			{/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div className="flex gap-2" onClick={onReviewClick} >
				<Rating defaultValue={data.averageRating} readOnly>
					{[1, 2, 3, 4, 5].map((value) => (
						<RatingButton key={value} size={14} />
					))}
				</Rating>
				<p className="text-sm text-gray-500 cursor-pointer hover:underline">{data?.totalReviews} đánh giá</p>
			</div>
			<Separator className="my-2" />
			<div className="space-x-2 mt-8">
				<span className="text-2xl font-bold">{formatVND(data.salePrice)}</span>
				<Badge variant="secondary">-{data.discount}%</Badge>
				<span className="text-sm line-through text-neutral-500">
					{formatVND(data.originPrice)}
				</span>
			</div>
		</div>
	);
}
