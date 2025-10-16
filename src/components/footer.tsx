import { MailIcon, MapPinIcon } from "lucide-react";

export function Footer() {
	return (
		<footer className="py-16 bg-neutral-50 px-8">
			<div className="max-w-6xl mx-auto">
				<p className="font-bold text-xl">Công Ty TNHH Nhất Tâm Senhome</p>
				<div className="space-y-2 mt-4">
					<div className="flex items-center space-x-4">
						<MapPinIcon className="size-5 inline" />
						<p>Phú Xuân, Nhà Bè, Hồ Chí Minh</p>
					</div>
					<div className="flex items-center space-x-4">
						<MailIcon className="size-5 inline" />
						<p>sales.senhome@gmail.com</p>
					</div>
					<p>Kết nối với chúng tôi</p>
				</div>
			</div>
		</footer>
	);
}
