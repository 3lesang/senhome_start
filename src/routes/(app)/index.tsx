import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/home";
import {
	getHeroCollectionsQueryOptions,
	getHomeCollectionsQueryOptions,
} from "@/queries/collection";

export const Route = createFileRoute("/(app)/")({
	component: HomePage,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(getHeroCollectionsQueryOptions);
		await context.queryClient.ensureQueryData(getHomeCollectionsQueryOptions);
	},
	head: () => ({
		meta: [
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
	}),
});
