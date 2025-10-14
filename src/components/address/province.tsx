import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ValueType = {
	value: string;
	label: string;
};

interface ProvinceSelectProps {
	value?: ValueType;
	onChange?: (value: ValueType) => void;
}

export function ProvinceSelect({ value, onChange }: ProvinceSelectProps) {
	const [open, setOpen] = useState(false);
	const [state, setState] = useState(value);

	const { isIntersecting, ref } = useIntersectionObserver({
		threshold: 0.5,
	});

	const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
		queryKey: ["province"],
		queryFn: async ({ pageParam }) => {
			const res = await axios.get("https://open.oapi.vn/location/provinces", {
				params: {
					page: pageParam,
					size: 10,
				},
			});
			return res.data;
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, _, lastPageParam) => {
			const total = lastPage.total;
			const totalPages = Math.ceil(total / 10);
			if (lastPageParam < totalPages) {
				return lastPageParam + 1;
			}
			return undefined;
		},
	});

	function handleSelect(value: ValueType) {
		setState(value);
		onChange?.(value);
		setOpen(false);
	}

	useEffect(() => {
		if (hasNextPage && isIntersecting) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, isIntersecting]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button type="button" variant="outline" className="w-full">
					{state?.label}
					<ChevronDownIcon className="ml-auto" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-56">
				<ScrollArea className="h-72">
					{data?.pages.map((page) => {
						return page?.data?.map((item: { id: string; name: string }) => (
							<Button
								type="button"
								key={item.id}
								variant="ghost"
								className="w-full justify-start"
								onClick={() =>
									handleSelect({ value: item.id, label: item.name })
								}
							>
								{item.name}
								<CheckIcon
									className={cn(
										"ml-auto",
										item.id === state?.value ? "opacity-100" : "opacity-0",
									)}
								/>
							</Button>
						));
					})}
					<div ref={ref}></div>
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
