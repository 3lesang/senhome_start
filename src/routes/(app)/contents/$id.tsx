import { createFileRoute } from "@tanstack/react-router";
import { getPageQueryOptions } from "@/api/page/one";
import { ContentPage } from "@/pages/content/one";

export const Route = createFileRoute("/(app)/contents/$id")({
	component: ContentPage,
	loader: ({ context, params }) => {
		return context.queryClient.ensureQueryData(getPageQueryOptions(params.id));
	},
});
