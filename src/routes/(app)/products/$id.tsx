import { createFileRoute } from "@tanstack/react-router";
import { ProductPage } from "@/pages/product/one";
import {
  getProductBySlugQueryOptions,
  getProductContentQueryOptions,
} from "@/queries/product";
import {
  getOverviewByProductQueryOptions,
  getReviewsByProductQueryOptions,
} from "@/queries/review";

export const Route = createFileRoute("/(app)/products/$id")({
  component: ProductPage,
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(
      getProductBySlugQueryOptions(params.id),
    );
    await context.queryClient.ensureQueryData(
      getOverviewByProductQueryOptions(product.id),
    );
    await context.queryClient.ensureQueryData(
      getReviewsByProductQueryOptions(product.id),
    );
    await context.queryClient?.ensureQueryData(
      getProductContentQueryOptions(product?.slug ?? ""),
    );
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { name: "description", content: loaderData?.meta_description },
      {
        title: loaderData?.meta_title,
      },
    ],
  }),
});
