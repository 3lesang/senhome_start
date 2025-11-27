import { type Ref, useEffect, useImperativeHandle, useState } from "react";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { cn, convertToFileUrl } from "@/lib/utils";

interface ProductCarouselProps {
	data: string[];
	ref?: Ref<CarouselApi>;
}

interface CarouselImageProps {
	data: string[];
	onChange?: (value: number) => void;
	value: number;
}

const CarouselImage = ({ value, data, onChange }: CarouselImageProps) => {
	const [current, setCurrent] = useState(value);

	function handleSelect(value: number) {
		setCurrent(value);
		onChange?.(value);
	}
	useEffect(() => {
		setCurrent(value);
	}, [value]);
	return (
		<div className="relative">
			<div className="overflow-auto no-scrollbar ">
				<div className="flex gap-2">
					{data.map((f, index) => (
						<button
							key={f}
							type="button"
							className={cn(
								"size-12 aspect-square bg-neutral-50 relative opacity-50 cursor-pointer",
								current === index && "opacity-100",
							)}
							onClick={() => handleSelect(index)}
						>
							<img
								src={convertToFileUrl(f)}
								alt="file"
								className="w-full h-full object-contain"
							/>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export const ProductCarousel = ({ data, ref }: ProductCarouselProps) => {
	const [api, setApi] = useState<CarouselApi>();

	useImperativeHandle(ref, () => api);
	const [current, setCurrent] = useState(0);
	useEffect(() => {
		if (!api) {
			return;
		}
		setCurrent(api.selectedScrollSnap());
		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	function handleClick(value: number) {
		api?.scrollTo(value);
	}
	return (
		<div className="space-y-2">
			<Carousel setApi={setApi}>
				<CarouselContent>
					{data.map((f) => (
						<CarouselItem key={f}>
							<div className="w-full h-full bg-neutral-50 rounded-2xl overflow-hidden aspect-square">
								{f && (
									<img
										src={convertToFileUrl(f)}
										alt="file"
										className="object-contain w-full h-full"
									/>
								)}
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="left-2" />
				<CarouselNext className="right-2" />
			</Carousel>
			<CarouselImage value={current} data={data} onChange={handleClick} />
		</div>
	);
};
