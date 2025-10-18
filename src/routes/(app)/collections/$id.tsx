import { createFileRoute } from "@tanstack/react-router";
import { getCollectionnQueryOptions } from "@/api/collection/one";
import { getProductsCollectionQueryOptions } from "@/api/product/list";
import { CollectionPage } from "@/pages/collection/one";

export const Route = createFileRoute("/(app)/collections/$id")({
	component: CollectionPage,
	loader: async ({ context, params }) => {
		const collection = await context.queryClient.ensureQueryData(
			getCollectionnQueryOptions(params.id),
		);
		await context.queryClient.ensureQueryData(
			getProductsCollectionQueryOptions({
				collectionId: collection.id,
				page: 1,
				limit: 10,
				sort: "-product.created",
			}),
		);
		return collection;
	},
	head: ({ loaderData }) => ({
		meta: [
			{ name: "description", content: loaderData?.seo.description },
			{ title: loaderData?.seo.title },
		],
	}),
});
