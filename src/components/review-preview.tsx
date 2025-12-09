/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import { type Ref, useEffect, useImperativeHandle, useState } from "react";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { convertToFileUrl } from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Rating, RatingButton } from "./kibo-ui/rating";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export type PreviewRefProps = {
	api: CarouselApi;
	setOpen: (value: boolean) => void;
	setCurrent: (value: number) => void;
};

type ReviewData = {
	files: string[];
	comment: string;
	rating: number;
	customer: { name: string; avatar: string };
};

interface ModalProps {
	render?: ({
		setOpen,
		setCurrent,
		setCurrentReview,
	}: {
		setOpen: (value: boolean) => void;
		setCurrent: (value: number) => void;
		setCurrentReview: (value: number) => void;
	}) => React.ReactNode;
	data?: ReviewData[];
	ref?: Ref<PreviewRefProps>;
}

export function ReviewPreview({ ref, render, data }: ModalProps) {
	const [currentReview, setCurrentReview] = useState(0);
	const review = data?.[currentReview];
	const [open, setOpen] = useState(false);
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	useImperativeHandle(ref, () => ({ api, setOpen, setCurrent }));

	useEffect(() => {
		api?.scrollTo(current, true);
	}, [api, current]);

	function handlerPrev() {
		api?.scrollPrev();
		const reviewIndex = currentReview === 0 ? currentReview : currentReview - 1;
		setCurrentReview(reviewIndex);
	}

	function handleNext() {
		api?.scrollNext();
		if (api?.canScrollNext()) return;
		const reviewIndex =
			currentReview === Number(data?.length) - 1
				? currentReview
				: currentReview + 1;
		setCurrentReview(reviewIndex);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{render?.({ setOpen, setCurrent, setCurrentReview })}
			<DialogContent className="min-w-7xl">
				<DialogHeader>
					<DialogTitle></DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<Separator />
				<div className="grid grid-cols-12">
					<div className="col-span-6">
						<Carousel setApi={setApi}>
							<CarouselContent className="">
								{review?.files.map((i) => (
									<CarouselItem key={i} className="aspect-square bg-black">
										<img
											src={convertToFileUrl(i)}
											alt=""
											className="object-contain h-full w-full"
										/>
									</CarouselItem>
								))}
							</CarouselContent>
							<Button
								size="icon"
								type="button"
								variant="outline"
								className="absolute left-2 top-1/2 -translate-y-1/2"
								onClick={handlerPrev}
							>
								<ChevronLeftIcon />
							</Button>
							<Button
								size="icon"
								type="button"
								variant="outline"
								className="absolute right-2 top-1/2 -translate-y-1/2"
								onClick={handleNext}
							>
								<ChevronRightIcon />
							</Button>
						</Carousel>
					</div>
					<div className="col-span-6 bg-white px-4">
						<div className="flex gap-2 items-center">
							<Avatar>
								{review?.customer.avatar && (
									<AvatarImage
										src={convertToFileUrl(review?.customer?.avatar)}
									></AvatarImage>
								)}
								<AvatarFallback>U</AvatarFallback>
							</Avatar>
							<p className="text-sm">{review?.customer?.name}</p>
						</div>
						<Rating defaultValue={review?.rating} readOnly>
							{[1, 2, 3, 4, 5].map((value) => (
								<RatingButton
									key={value}
									size={16}
									className="text-yellow-300"
								/>
							))}
						</Rating>
						<p>{review?.comment}</p>
						<div className="grid grid-cols-8">
							{review?.files.map((f) => (
								<div key={f} className="aspect-square bg-neutral-50 rounded-lg">
									<img
										key={f}
										src={convertToFileUrl(f)}
										alt=""
										className="h-full object-contain"
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
