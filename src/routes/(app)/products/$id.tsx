import { createFileRoute } from "@tanstack/react-router";
import { getOptionsProduct } from "@/api/option/list";
import { getProductQueryOptions } from "@/api/product/one";
import { getReviewsProductQueryOptions } from "@/api/review/list";
import { getVariantsProduct } from "@/api/variant/list";
import { OneProductPage } from "@/pages/product/one";

export const Route = createFileRoute("/(app)/products/$id")({
	component: OneProductPage,
	loader: async ({ context, params }) => {
		const product = await context.queryClient.ensureQueryData(
			getProductQueryOptions(params.id),
		);
		await context.queryClient.ensureQueryData(getOptionsProduct(product.id));
		await context.queryClient.ensureQueryData(getVariantsProduct(product.id));
		await context.queryClient.ensureQueryData(
			getReviewsProductQueryOptions(product.id),
		);
		return product;
	},
	head: ({ loaderData }) => ({
		meta: [
			{ name: "description", content: loaderData?.seo.description },
			{
				title: loaderData?.seo.title,
			},
		],
	}),
});
