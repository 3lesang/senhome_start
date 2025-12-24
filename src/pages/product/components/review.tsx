/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { memo, useRef, useState } from "react";
import { type PreviewRefProps, ReviewPreview } from "@/components/review-preview";
import { Rating } from "@/components/shadcnblocks/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { convertToFileUrl } from "@/lib/utils";
import {
	getOverviewByProductQueryOptions,
	getReviewsByProductQueryOptions,
} from "@/queries/review";

const ReviewOverview = ({ id }: { id: number }) => {
	const getOverviewQuery = useSuspenseQuery(
		getOverviewByProductQueryOptions(id),
	);
	const ref = useRef<PreviewRefProps>(null)

	return (
		<div className="flex flex-col lg:flex-row mb-4 gap-8">
			<div>
				<p className="font-medium text-sm mb-8">Tổng quan</p>
				<div className="flex gap-4">
					<p className="font-bold text-2xl">
						{getOverviewQuery.data.average_rating}
					</p>
					<Rating rate={getOverviewQuery.data.average_rating} />
				</div>
				<p className="text-neutral-400 font-light text-sm">
					({getOverviewQuery.data.total_reviews} đánh giá)
				</p>
			</div>
			<div>
				<p className="font-medium text-sm mb-4">
					Tất cả hình ảnh ({getOverviewQuery.data.total_files})
				</p>
				<div className="grid grid-cols-4 lg:grid-cols-12 gap-2">
					<ReviewPreview
						ref={ref}
						data={getOverviewQuery.data.data}
					/>
					{
						getOverviewQuery.data.data?.map((r, idxReview) =>
							r.files.map((f, index) => (
								<img
									key={f}
									src={convertToFileUrl(f)}
									alt=""
									className="aspect-square rounded object-contain cursor-pointer"
									onClick={() => {
										ref.current?.setOpen?.(true)
										ref.current?.setCurrentReview?.(idxReview)
										ref.current?.setScrollIndex?.(index)
									}}
								/>
							)),
						)
					}
				</div>
			</div>
		</div>
	);
};

const ListReview = ({ id }: { id: number }) => {
	const [params, setParams] = useState({
		sort_flag: 0,
		has_image: false,
		rating: 0,
	});

	const ref = useRef<PreviewRefProps>(null)

	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([_, value]) => Boolean(value)),
	);

	const getReviewsQuery = useQuery(
		getReviewsByProductQueryOptions(id, filteredParams),
	);

	return (
		<div>
			<p className="text-sm font-medium mb-4">Lọc theo</p>
			<div className="flex gap-2 flex-wrap mb-4">
				<Button
					type="button"
					variant={params.sort_flag ? "default" : "secondary"}
					className="rounded-full"
					onClick={() =>
						setParams((prev) => ({
							...prev,
							sort_flag: prev.sort_flag === 0 ? 1 : 0,
						}))
					}
				>
					Mới nhất
				</Button>
				<Button
					type="button"
					variant={params.has_image ? "default" : "secondary"}
					className="rounded-full"
					onClick={() =>
						setParams((prev) => ({ ...prev, has_image: !prev.has_image }))
					}
				>
					Có hình ảnh
				</Button>
				<Button
					type="button"
					variant={params.rating === 0 ? "default" : "secondary"}
					className="rounded-full"
					onClick={() => setParams((prev) => ({ ...prev, rating: 0 }))}
				>
					Tất cả
				</Button>
				{[5, 4, 3, 2, 1].map((i) => (
					<Button
						key={i}
						type="button"
						variant={params.rating === i ? "default" : "secondary"}
						className="rounded-full"
						onClick={() => setParams((prev) => ({ ...prev, rating: i }))}
					>
						{i} sao
					</Button>
				))}
			</div>
			<div className="space-y-4">
				<ReviewPreview
					ref={ref}
					data={getReviewsQuery.data?.data}
				/>
				{getReviewsQuery.data?.data?.map((item, idxReview) => (
					<div key={item.id} className="">
						<div>
							<div className="flex gap-2 items-center">
								<Avatar>
									<AvatarImage
										src={convertToFileUrl(item?.customer?.avatar)}
									></AvatarImage>
									<AvatarFallback>U</AvatarFallback>
								</Avatar>
								<p className="text-sm">{item?.customer?.name}</p>
							</div>
							<Rating rate={item.rating} className="w-24" />
						</div>
						<p className="text-sm mb-4">{item.comment}</p>
						{
							<div className="flex gap-2">
								{item.files.map((f, index) => (
									<img
										key={f}
										className="size-20 object-contain rounded cursor-pointer"
										src={convertToFileUrl(f)}
										alt=""
										onClick={() => {
											ref.current?.setOpen?.(true)
											ref.current?.setCurrentReview?.(idxReview)
											ref.current?.setScrollIndex?.(index)
										}}
									/>
								))}
							</div>
						}
					</div>
				))}
			</div>
		</div>
	);
};

export const ProductReview = memo(({ id }: { id: number }) => {
	return (
		<div className="container mx-auto py-16 px-4 lg:px-0">
			<p className="uppercase font-bold text-2xl mb-4">Đánh giá sản phẩm</p>
			<ReviewOverview id={id} />
			<ListReview id={id} />
		</div>
	);
});
