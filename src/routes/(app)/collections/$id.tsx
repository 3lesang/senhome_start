import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/pages/collection/one";
import { getCollectionQueryOptions } from "@/queries/collection";
import { getProductsByCollectionIDQueryOptions } from "@/queries/product";

export const Route = createFileRoute("/(app)/collections/$id")({
	component: CollectionPage,
	loader: async ({ context, params }) => {
		const getCollectionQuery = await context.queryClient.ensureQueryData(
			getCollectionQueryOptions(params.id),
		);
		await context.queryClient.ensureQueryData(
			getProductsByCollectionIDQueryOptions(getCollectionQuery.id),
		);
		return getCollectionQuery;
	},
	head: ({ loaderData }) => ({
		meta: [
			{ name: "description", content: loaderData?.meta_description },
			{ title: loaderData?.meta_title },
		],
	}),
});
