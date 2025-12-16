/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem
} from "@/components/ui/carousel";
import { cn, convertToFileUrl } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { type Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Rating } from "./shadcnblocks/rating";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";

export type PreviewRefProps = {
	setOpen?: (value: boolean) => void;
	setCurrentReview?: (value: number) => void;
	setScrollIndex?: (value: number) => void;
};

type ReviewData = {
	files: string[];
	comment: string;
	rating: number;
	customer: { name: string; avatar: string };
};

interface ModalProps {
	data?: ReviewData[];
	ref?: Ref<PreviewRefProps>;
}

interface ReviewCarouselProps {
	data: string[]
	onChange?: (value: number) => void
	current?: number;
	ref: Ref<CarouselApi>
	onReviewPrev?: () => void;
	onReviewNext?: () => void;
}

function ReviewCarousel({ data, onChange, current, ref, onReviewNext, onReviewPrev }: ReviewCarouselProps) {
	const [api, setApi] = useState<CarouselApi>();
	useImperativeHandle(ref, () => api)

	function handlePrev() {
		const canPrev = api?.canScrollPrev()
		if (canPrev) {
			api?.scrollPrev()
		} else {
			onReviewPrev?.()
		}
	}

	function handleNext() {
		const canNext = api?.canScrollNext()
		if (canNext) {
			api?.scrollNext()
		} else {
			onReviewNext?.()
		}
	}

	useEffect(() => {
		if (!api) {
			return
		}
		api.on("select", () => {
			onChange?.(api.selectedScrollSnap())
		})
	}, [api, data])

	useEffect(() => {
		api?.scrollTo(Number(current), true)
	}, [api, current, data])

	return <Carousel setApi={setApi}>
		<CarouselContent>
			{data.map((i) => (
				<CarouselItem key={i} className="aspect-square bg-neutral-50">
					<img
						src={convertToFileUrl(i)}
						alt=""
						className="object-contain h-full w-full"
					/>
				</CarouselItem>
			))}
		</CarouselContent>
		<Button type="button" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer" onClick={handlePrev}>
			<ChevronLeftIcon />
		</Button>
		<Button type="button" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer" onClick={handleNext}>
			<ChevronRightIcon />
		</Button>
	</Carousel>
}

export function ReviewPreview({ ref, data }: ModalProps) {
	const [currentReview, setCurrentReview] = useState(0);
	const [open, setOpen] = useState(false);
	const [scrollIndex, setScrollIndex] = useState(0)
	const [current, setCurrent] = useState(scrollIndex);

	const carouselRef = useRef<CarouselApi>(null)
	useImperativeHandle(ref, () => ({
		setOpen, setCurrentReview, setScrollIndex
	}))

	const review = data?.[currentReview];

	useEffect(() => {
		setCurrent(scrollIndex)
	}, [scrollIndex])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="lg:min-w-7xl" >
				<DialogHeader>
					<DialogTitle>Đánh giá</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-1 lg:grid-cols-2">
					<div className="col-span-1">
						<ReviewCarousel ref={carouselRef} current={scrollIndex} data={review?.files ?? []} onChange={setCurrent} onReviewPrev={() => {
							const canReviewPrev = currentReview > 0;
							if (!canReviewPrev) return
							setCurrentReview((prev) => prev - 1)
							setCurrent(0)
							setScrollIndex(0)
						}} onReviewNext={() => {
							const canPrevNext = currentReview < Number(data?.length) - 1
							if (!canPrevNext) return
							setCurrent(0)
							setScrollIndex(0)
							setCurrentReview((prev) => prev + 1)
						}} />
					</div>
					<div className="col-span-1 bg-white px-4">
						<div className="flex gap-2 items-center">
							<Avatar>
								{review?.customer.avatar && (
									<AvatarImage
										src={convertToFileUrl(review?.customer?.avatar)}
									/>
								)}
								<AvatarFallback>U</AvatarFallback>
							</Avatar>
							<p className="text-sm">{review?.customer?.name}</p>
						</div>
						<Rating rate={review?.rating ?? 1} />
						<p>{review?.comment}</p>
						<div className="grid grid-cols-12 gap-2">
							{review?.files.map((f, index) => (
								<div key={f} className={cn("aspect-square bg-neutral-50 rounded border cursor-pointer", index === current && "ring-1 ring-black")} onClick={() => {
									carouselRef.current?.scrollTo(index)
								}}>
									<img
										key={f}
										src={convertToFileUrl(f)}
										alt=""
										className="h-full w-full object-contain"
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
