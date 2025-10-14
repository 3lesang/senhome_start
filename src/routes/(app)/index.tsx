import { createFileRoute } from "@tanstack/react-router";
import {
	getCollectionsHeroQueryOptions,
	getCollectionsHomeQueryOptions,
} from "@/api/collection/list";
import { HomePage } from "@/pages/home";

export const Route = createFileRoute("/(app)/")({
	component: HomePage,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(getCollectionsHomeQueryOptions());
		return context.queryClient.ensureQueryData(
			getCollectionsHeroQueryOptions(),
		);
	},
});
