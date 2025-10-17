import { useSuspenseQuery } from "@tanstack/react-query";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { getStoreQueryOptions } from "@/api/store";

export function Footer() {
	const { data: store } = useSuspenseQuery(getStoreQueryOptions());
	return (
		<footer className="py-8 lg:py-16 bg-neutral-50 px-4 lg:px-8">
			<div className="max-w-6xl mx-auto">
				<p className="font-bold text-xl mb-8">{store.name}</p>
				<div className="space-y-2 text-neutral-800">
					<div className="flex items-center space-x-2">
						<MapPinIcon className="size-4 inline" />
						<p className="text-sm">Phú Xuân, Nhà Bè, Hồ Chí Minh</p>
					</div>
					<div className="flex items-center space-x-2">
						<MailIcon className="size-4 inline" />
						<p className="text-sm">{store.email}</p>
					</div>
					<div className="flex items-center space-x-2">
						<PhoneIcon className="size-4 inline" />
						<p className="text-sm">{store.phone}</p>
					</div>
					<img
						src="/LnLVN_logoSaleNoti_240916.png"
						alt=""
						className="w-72 object-cover"
					/>
					<p className="text-sm">
						© {new Date().getFullYear()}. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
