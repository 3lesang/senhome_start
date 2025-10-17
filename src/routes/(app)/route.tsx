import { createFileRoute } from "@tanstack/react-router";
import { getOneMenuQueryOptions } from "@/api/menu/one";
import { getStoreQueryOptions } from "@/api/store";
import { MainLayout } from "@/components/layouts/main";

export const Route = createFileRoute("/(app)")({
	component: MainLayout,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(getOneMenuQueryOptions());
		return context.queryClient.ensureQueryData(getStoreQueryOptions());
	},
});
