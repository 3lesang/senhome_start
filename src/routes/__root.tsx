import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Nprogress from "nprogress";
import { Toaster } from "@/components/ui/sonner";
import "nprogress/nprogress.css";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{
		head: () => ({
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{
					title:
						"Senhome | Kiến Tạo Nét Đẹp Không Gian Sống - Tự hào sản xuất tại Việt Nam",
				},
				{
					name: "description",
					content:
						"Senhome là cửa hàng trực tuyến chuyên cung cấp đồ nội thất nhà bếp uy tín, mang đến cho khách hàng những sản phẩm chất lượng cao, thiết kế tinh tế và giá cả hợp lý",
				},
			],
			links: [
				{
					rel: "stylesheet",
					href: appCss,
				},
			],
		}),

		shellComponent: RootDocument,
	},
);

function RootDocument({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	router.subscribe("onBeforeLoad", () => {
		Nprogress.start();
	});
	router.subscribe("onLoad", () => {
		Nprogress.done();
	});
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					eventBusConfig={{
						debug: false,
						connectToServerBus: true,
					}}
					plugins={[
						{
							name: "TanStack Query",
							render: <ReactQueryDevtoolsPanel />,
						},
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
				<Toaster closeButton />
			</body>
		</html>
	);
}
