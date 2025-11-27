import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { shortVND } from "@/lib/utils";
import { getDiscountsQueryOptions } from "@/queries/discount";

type DiscountData = {
	code: string;
	description: string;
	effects: {
		applies_to: string;
		effect_type: string;
		value: string;
	}[];
};

interface DiscountItemProps {
	data: DiscountData;
}

function DiscountItem({ data }: DiscountItemProps) {
	const [effect] = data.effects;
	const discountValue =
		effect.effect_type === "fixed"
			? shortVND(Number(effect.value))
			: `${effect.value} %`;
	return (
		<HoverCard>
			<HoverCardTrigger>
				<Badge variant="outline" className="cursor-pointer">
					Giảm {discountValue}
				</Badge>
			</HoverCardTrigger>
			<HoverCardContent className="w-fit">
				<p className="text-sm text-center">
					Nhập <span className="font-semibold">{data.code}</span>
				</p>
				<p className="text-sm whitespace-nowrap">{data.description}</p>
			</HoverCardContent>
		</HoverCard>
	);
}

export function ProductDiscount() {
	const getDiscountsQuery = useSuspenseQuery(getDiscountsQueryOptions());

	const freeShipDiscounts = getDiscountsQuery.data?.filter(
		(d) => d.discount_type === "automatic",
	);

	const codeDiscounts = getDiscountsQuery.data?.filter(
		(d) => d.discount_type === "code",
	);

	return (
		<div>
			<div className="flex gap-2 mb-4">
				{freeShipDiscounts?.map((d) => (
					<p key={d.id} className="text-sm">
						{d.title}
					</p>
				))}
			</div>
			{codeDiscounts?.length > 0 && (
				<div className="flex gap-2">
					<p>Mã khuyến mãi</p>
					{codeDiscounts.map((d) => (
						<DiscountItem
							key={d.id}
							data={{
								code: d.code,
								description: d.description,
								effects: d.effects,
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}
