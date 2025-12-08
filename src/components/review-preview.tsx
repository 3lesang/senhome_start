/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { type Ref, useEffect, useImperativeHandle, useState } from "react";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { convertToFileUrl } from "@/lib/utils";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent } from "./ui/dialog";

export type PreviewRefProps = {
	api: CarouselApi;
	setOpen: (value: boolean) => void;
	setCurrent: (value: number) => void;
};

interface ModalProps {
	render?: ({
		setOpen,
		setCurrent,
	}: {
		setOpen: (value: boolean) => void;
		setCurrent: (value: number) => void;
	}) => React.ReactNode;
	data?: string[];
	ref?: Ref<PreviewRefProps>;
}

export function ReviewPreview({ ref, render, data }: ModalProps) {
	const [open, setOpen] = useState(false);
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	function handleNext() {
		api?.scrollNext();
	}

	function handlerPrevious() {
		api?.scrollPrev();
	}

	useImperativeHandle(ref, () => ({ api, setOpen, setCurrent }));

	useEffect(() => {
		api?.scrollTo(current, true);
	}, [api, current]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{render?.({ setOpen, setCurrent })}
			<DialogContent
				showCloseButton={false}
				className="bg-transparent border-0 shadow-none h-screen min-w-screen"
			>
				<div className="flex justify-end">
					<DialogClose asChild>
						<Button type="button" size="icon" variant="outline" className="">
							<XIcon />
						</Button>
					</DialogClose>
				</div>
				<div className="flex justify-center items-center lg:gap-32">
					<Button
						type="button"
						size="icon"
						variant="outline"
						className=""
						onClick={handlerPrevious}
					>
						<ChevronLeftIcon />
					</Button>
					<div>
						<Carousel className="lg:w-[600px]" setApi={setApi}>
							<CarouselContent className="">
								{data?.map((i) => (
									<CarouselItem
										key={i}
										className="h-80 lg:h-[600px] w-full bg-white"
									>
										<img
											src={convertToFileUrl(i)}
											alt=""
											className="size-full object-contain"
										/>
									</CarouselItem>
								))}
							</CarouselContent>
						</Carousel>
					</div>

					<Button
						type="button"
						size="icon"
						variant="outline"
						className=""
						onClick={handleNext}
					>
						<ChevronRightIcon />
					</Button>
				</div>
				<div className="flex gap-4 w-full max-w-6xl mx-auto overflow-x-auto">
					{data?.map((f, index) => (
						<div key={f} className="">
							<div className="size-16 lg:size-24 bg-white">
								<img
									src={convertToFileUrl(f)}
									alt=""
									className="object-contain size-full cursor-pointer"
									onClick={() => {
										api?.scrollTo(index);
									}}
								/>
							</div>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
