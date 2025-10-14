import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
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

interface DistrictSelectProps {
	value?: ValueType;
	onChange?: (value: ValueType) => void;
	id: string;
}

export function DistrictSelect({ value, onChange, id }: DistrictSelectProps) {
	const [open, setOpen] = useState(false);
	const [state, setState] = useState(value);

	const { data } = useQuery({
		queryKey: ["district", id],
		queryFn: async () => {
			const res = await axios.get(
				`https://open.oapi.vn/location/districts/${id}`,
				{
					params: {
						page: 0,
						size: 100,
					},
				},
			);
			return res?.data;
		},
		enabled: !!id,
	});

	function handleSelect(value: ValueType) {
		setState(value);
		onChange?.(value);
		setOpen(false);
	}

	useEffect(() => {
		setState(value);
	}, [value]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="w-full justify-start"
					disabled={!id}
				>
					<p className="line-clamp-1 whitespace-normal">{id && state?.label}</p>
					<ChevronDownIcon className="ml-auto" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-56">
				<ScrollArea className="h-72">
					{data?.data?.map((item: { id: string; name: string }) => (
						<Button
							type="button"
							key={item.id}
							variant="ghost"
							className="w-full justify-start"
							onClick={() => handleSelect({ value: item.id, label: item.name })}
						>
							{item.name}
							<CheckIcon
								className={cn(
									"ml-auto",
									item.id === state?.value ? "opacity-100" : "opacity-0",
								)}
							/>
						</Button>
					))}
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
