import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { convertToFileUrl } from "@/lib/utils";
import { getMenuItemQueryOptions, getMenuQueryOptions } from "@/queries/menu";
import { getStoreQueryOptions } from "@/queries/store";
import { Separator } from "./ui/separator";

function getSocialIcon(key: string) {
	const icons: Record<string, string> = {
		facebook: "/facebook.svg",
		youtube: "/youtube.svg",
		instagram: "/instagram.svg",
		tiktok: "/tiktok.svg",
	};
	return icons[key];
}

export function Footer() {
	const getStoreQuery = useSuspenseQuery(getStoreQueryOptions());
	const getFooterMenuQuery = useSuspenseQuery(getMenuQueryOptions("footer"));
	const getMenuItemQuery = useSuspenseQuery(
		getMenuItemQueryOptions(getFooterMenuQuery.data?.id ?? 0),
	);

	return (
		<footer className="py-8 lg:py-16 bg-neutral-50">
			<div className="container mx-auto">
				<div className="px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
					{getMenuItemQuery.data.map((i) => {
						return (
							<ul key={i.name} className="space-y-4">
								<li className="whitespace-nowrap font-bold">{i.name}</li>
								{i.items.map((c) => (
									<li key={c.name}>
										<Link
											to="/contents/$id"
											params={{ id: c.url }}
											className="text-sm block whitespace-nowrap font-light hover:underline"
										>
											{c.name}
										</Link>
										{c.items.map((i) => (
											<p className="text-sm font-light" key={i.name}>{i.name}</p>
										))}
									</li>
								))}
							</ul>
						);
					})}
					<div className="space-y-4">
						<p className="whitespace-nowrap font-bold uppercase">Kết nối</p>
						<div className="flex gap-2">
							{Object.entries(getStoreQuery.data.social).map(
								([key, value]) =>
									value && (
										<a key={key} href={value} target="_blank">
											<img
												src={getSocialIcon(key)}
												alt={key}
												className="size-8"
											/>
										</a>
									),
							)}
						</div>
					</div>
				</div>
				<Separator className="my-8" />
				<div className="px-4 lg:grid lg:grid-cols-3 gap-8 text-sm font-light">
					<div className="flex gap-2">
						<img
							src={convertToFileUrl(getStoreQuery.data.logo)}
							alt="logo"
							className="hidden lg:block size-16 object-cover"
						/>
						<div>
							<p className="mb-4">{getStoreQuery.data.name}</p>
							<p className="text-neutral-800 text-xs">
								{getStoreQuery.data.description}
							</p>
						</div>
					</div>
					<div className="hidden lg:block space-y-2 text-neutral-800">
						<div className="flex items-center space-x-2">
							<MapPinIcon className="size-4 min-w-4 inline" />
							<p>{getStoreQuery.data.address}</p>
						</div>
						<div className="flex items-center space-x-2">
							<MailIcon className="size-4 inline" />
							<p>{getStoreQuery.data.email}</p>
						</div>
						<div className="flex items-center space-x-2">
							<PhoneIcon className="size-4 inline" />
							<p>{getStoreQuery.data.phone}</p>
						</div>
					</div>
					<div>
						<div className="grid grid-cols-4 gap-2">
							{getStoreQuery.data.certificates.map((c) => (
								<a key={c.id} href={c.url} target="_blank">
									<img
										src={convertToFileUrl(c.file_url)}
										alt=""
										className="object-cover"
									/>
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className="fixed bottom-8 right-2 space-y-4 z-50">
				{getStoreQuery.data.zalo && (
					<a href={getStoreQuery.data.zalo} target="_blank" className="block">
						<img
							src="/zalo_logo.png"
							alt="zalo"
							className="size-14 rounded-full object-cover"
						/>
					</a>
				)}
				{getStoreQuery.data.hotline && (
					<a href={`tel:${getStoreQuery.data.hotline}`} className="block">
						<img
							src="/tel-phone-icon-5.png"
							alt=""
							className="size-14 rounded-full"
						/>
					</a>
				)}
			</div>
		</footer>
	);
}
