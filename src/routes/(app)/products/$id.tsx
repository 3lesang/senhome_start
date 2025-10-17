import { createFileRoute } from "@tanstack/react-router";
import { getOptionsProduct } from "@/api/option/list";
import { getProductQueryOptions } from "@/api/product/one";
import { getVariantsProduct } from "@/api/variant/list";
import { ProductPage } from "@/pages/product/one";

export const Route = createFileRoute("/(app)/products/$id")({
	component: ProductPage,
	loader: async ({ context, params }) => {
		const product = await context.queryClient.ensureQueryData(
			getProductQueryOptions(params.id),
		);
		await context.queryClient.ensureQueryData(getOptionsProduct(product.id));
		await context.queryClient.ensureQueryData(getVariantsProduct(product.id));
		return product;
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData?.name,
			},
		],
	}),
});
