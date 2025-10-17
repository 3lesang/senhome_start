import { createFileRoute } from "@tanstack/react-router";
import { getStoreQueryOptions } from "@/api/store";
import { MainLayout } from "@/components/layouts/main";

export const Route = createFileRoute("/(app)")({
	component: MainLayout,
	loader: ({ context }) => {
		return context.queryClient.ensureQueryData(getStoreQueryOptions());
	},
});
