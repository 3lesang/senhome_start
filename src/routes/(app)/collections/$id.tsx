import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { getCollectionnQueryOptions } from "@/api/collection/one";
import { getProductsCollectionQueryOptions } from "@/api/product/list";
import { CollectionPage } from "@/pages/collection/one";

const schema = z.object({
	sort: z.string().default("-product.created"),
});

export const Route = createFileRoute("/(app)/collections/$id")({
	component: CollectionPage,
	validateSearch: schema,
	loaderDeps: ({ search }) => search,
	loader: async ({ context, params, deps }) => {
		const collection = await context.queryClient.ensureQueryData(
			getCollectionnQueryOptions(params.id),
		);

		await context.queryClient.ensureQueryData(
			getProductsCollectionQueryOptions({
				collectionId: collection.id,
				page: 1,
				limit: 10,
				sort: deps.sort,
			}),
		);
		return collection;
	},
});
